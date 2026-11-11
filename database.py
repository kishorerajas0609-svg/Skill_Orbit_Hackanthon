import asyncio
import json
import os
import re
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
import motor.motor_asyncio
from config import settings

class LocalAsyncCollection:
    """Async document collection backed by persistent file storage for zero-dependency operation."""
    def __init__(self, db: 'LocalAsyncDatabase', name: str):
        self.db = db
        self.name = name

    async def insert_one(self, document: Dict[str, Any]):
        doc = dict(document)
        if "_id" not in doc:
            doc["_id"] = str(uuid.uuid4())
        # Convert any non-serializable objects (like datetime) to ISO strings
        clean_doc = self._serialize(doc)
        data = self.db._get_data(self.name)
        data.append(clean_doc)
        self.db._save_data(self.name, data)
        
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(clean_doc["_id"])

    async def find_one(self, query: Dict[str, Any] = None) -> Optional[Dict[str, Any]]:
        query = query or {}
        data = self.db._get_data(self.name)
        for doc in data:
            if self._matches(doc, query):
                return dict(doc)
        return None

    def find(self, query: Dict[str, Any] = None):
        query = query or {}
        data = self.db._get_data(self.name)
        matched = [dict(doc) for doc in data if self._matches(doc, query)]
        return LocalAsyncCursor(matched)

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]) -> Any:
        data = self.db._get_data(self.name)
        modified_count = 0
        for i, doc in enumerate(data):
            if self._matches(doc, query):
                new_doc = dict(doc)
                if "$set" in update:
                    for k, v in update["$set"].items():
                        self._set_nested(new_doc, k, self._serialize(v))
                if "$push" in update:
                    for k, v in update["$push"].items():
                        if k not in new_doc or not isinstance(new_doc[k], list):
                            new_doc[k] = []
                        new_doc[k].append(self._serialize(v))
                if "$inc" in update:
                    for k, v in update["$inc"].items():
                        new_doc[k] = new_doc.get(k, 0) + v
                if "$pull" in update:
                    for k, v in update["$pull"].items():
                        if k in new_doc and isinstance(new_doc[k], list):
                            new_doc[k] = [item for item in new_doc[k] if item != v]
                data[i] = new_doc
                modified_count = 1
                break
        if modified_count > 0:
            self.db._save_data(self.name, data)

        class UpdateResult:
            def __init__(self, count):
                self.modified_count = count
        return UpdateResult(modified_count)

    async def update_many(self, query: Dict[str, Any], update: Dict[str, Any]) -> Any:
        data = self.db._get_data(self.name)
        modified_count = 0
        for i, doc in enumerate(data):
            if self._matches(doc, query):
                new_doc = dict(doc)
                if "$set" in update:
                    for k, v in update["$set"].items():
                        self._set_nested(new_doc, k, self._serialize(v))
                data[i] = new_doc
                modified_count += 1
        if modified_count > 0:
            self.db._save_data(self.name, data)
        class UpdateResult:
            def __init__(self, count):
                self.modified_count = count
        return UpdateResult(modified_count)

    async def delete_one(self, query: Dict[str, Any]) -> Any:
        data = self.db._get_data(self.name)
        deleted_count = 0
        for i, doc in enumerate(data):
            if self._matches(doc, query):
                data.pop(i)
                deleted_count = 1
                break
        if deleted_count > 0:
            self.db._save_data(self.name, data)
        class DeleteResult:
            def __init__(self, count):
                self.deleted_count = count
        return DeleteResult(deleted_count)

    async def delete_many(self, query: Dict[str, Any]) -> Any:
        data = self.db._get_data(self.name)
        original_len = len(data)
        data = [doc for doc in data if not self._matches(doc, query)]
        deleted_count = original_len - len(data)
        if deleted_count > 0:
            self.db._save_data(self.name, data)
        class DeleteResult:
            def __init__(self, count):
                self.deleted_count = count
        return DeleteResult(deleted_count)

    async def count_documents(self, query: Dict[str, Any] = None) -> int:
        query = query or {}
        data = self.db._get_data(self.name)
        return sum(1 for doc in data if self._matches(doc, query))

    def _set_nested(self, doc: dict, path: str, value: Any):
        parts = path.split(".")
        curr = doc
        for p in parts[:-1]:
            if p not in curr or not isinstance(curr[p], dict):
                curr[p] = {}
            curr = curr[p]
        curr[parts[-1]] = value

    def _serialize(self, obj: Any) -> Any:
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, dict):
            return {k: self._serialize(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [self._serialize(i) for i in obj]
        return obj

    def _matches(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        if not query:
            return True
        for k, v in query.items():
            if k == "$or":
                if not any(self._matches(doc, subq) for subq in v):
                    return False
                continue
            if k == "$and":
                if not all(self._matches(doc, subq) for subq in v):
                    return False
                continue

            doc_val = doc.get(k)
            if isinstance(v, dict):
                for op, op_val in v.items():
                    if op == "$eq" and doc_val != op_val:
                        return False
                    elif op == "$ne" and doc_val == op_val:
                        return False
                    elif op == "$in":
                        if isinstance(doc_val, list):
                            if not any(item in op_val for item in doc_val):
                                return False
                        elif doc_val not in op_val:
                            return False
                    elif op == "$nin" and doc_val in op_val:
                        return False
                    elif op == "$gt" and not (doc_val is not None and doc_val > op_val):
                        return False
                    elif op == "$gte" and not (doc_val is not None and doc_val >= op_val):
                        return False
                    elif op == "$lt" and not (doc_val is not None and doc_val < op_val):
                        return False
                    elif op == "$lte" and not (doc_val is not None and doc_val <= op_val):
                        return False
                    elif op == "$regex":
                        pattern = op_val
                        flags = 0
                        if "$options" in v and "i" in v["$options"]:
                            flags = re.IGNORECASE
                        if doc_val is None or not re.search(pattern, str(doc_val), flags):
                            return False
            elif isinstance(doc_val, list) and not isinstance(v, list):
                if v not in doc_val:
                    return False
            else:
                if doc_val != v:
                    return False
        return True


class LocalAsyncCursor:
    def __init__(self, data: List[Dict[str, Any]]):
        self.data = data
        self._sort_key = None
        self._sort_dir = 1
        self._skip_count = 0
        self._limit_count = None

    def sort(self, key_or_list, direction: int = 1):
        if isinstance(key_or_list, list):
            self._sort_key, self._sort_dir = key_or_list[0]
        else:
            self._sort_key = key_or_list
            self._sort_dir = direction
        return self

    def skip(self, count: int):
        self._skip_count = count
        return self

    def limit(self, count: int):
        self._limit_count = count
        return self

    async def to_list(self, length: Optional[int] = None) -> List[Dict[str, Any]]:
        result = list(self.data)
        if self._sort_key:
            def sort_val(x):
                val = x.get(self._sort_key)
                return "" if val is None else val
            result.sort(key=sort_val, reverse=(self._sort_dir == -1))
        if self._skip_count:
            result = result[self._skip_count:]
        if self._limit_count is not None:
            result = result[:self._limit_count]
        if length is not None:
            result = result[:length]
        return result


class LocalAsyncDatabase:
    def __init__(self, storage_file: str):
        self.storage_file = storage_file
        self.collections: Dict[str, List[Dict[str, Any]]] = {}
        self._load()

    def _load(self):
        if os.path.exists(self.storage_file):
            try:
                with open(self.storage_file, "r", encoding="utf-8") as f:
                    self.collections = json.load(f)
            except Exception:
                self.collections = {}
        else:
            self.collections = {}

    def _save(self):
        os.makedirs(os.path.dirname(self.storage_file), exist_ok=True)
        with open(self.storage_file, "w", encoding="utf-8") as f:
            json.dump(self.collections, f, indent=2, default=str)

    def _get_data(self, collection_name: str) -> List[Dict[str, Any]]:
        if collection_name not in self.collections:
            self.collections[collection_name] = []
        return self.collections[collection_name]

    def _save_data(self, collection_name: str, data: List[Dict[str, Any]]):
        self.collections[collection_name] = data
        self._save()

    def __getitem__(self, name: str) -> LocalAsyncCollection:
        return LocalAsyncCollection(self, name)


class DatabaseManager:
    def __init__(self):
        self.is_connected = False
        self.db = None
        self.client = None

    async def connect(self):
        # Attempt to connect to real MongoDB
        storage_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "store.json")
        try:
            client = motor.motor_asyncio.AsyncIOMotorClient(
                settings.DATABASE_URL,
                serverSelectionTimeoutMS=1500
            )
            # Check server connection
            await client.admin.command('ping')
            self.client = client
            self.db = client[settings.DATABASE_NAME]
            self.is_connected = True
            print(" Connected successfully to MongoDB Atlas / Server")
        except Exception as e:
            print(f" Notice: Remote/Local MongoDB not connected ({e}). Using persistent embedded local async document database.")
            self.db = LocalAsyncDatabase(storage_path)
            self.is_connected = True

    def get_collection(self, name: str):
        return self.db[name]


db_manager = DatabaseManager()

# Collection getters for clean typed access
def get_users_col():
    return db_manager.get_collection("users")

def get_student_profiles_col():
    return db_manager.get_collection("student_profiles")

def get_recruiter_profiles_col():
    return db_manager.get_collection("recruiter_profiles")

def get_institution_profiles_col():
    return db_manager.get_collection("institution_profiles")

def get_academician_profiles_col():
    return db_manager.get_collection("academician_profiles")

def get_opportunities_col():
    return db_manager.get_collection("opportunities")

def get_applications_col():
    return db_manager.get_collection("applications")

def get_assessments_col():
    return db_manager.get_collection("assessments")

def get_questions_col():
    return db_manager.get_collection("questions")

def get_assessment_attempts_col():
    return db_manager.get_collection("assessment_attempts")

def get_skill_passport_col():
    return db_manager.get_collection("skill_passport")

def get_roadmaps_col():
    return db_manager.get_collection("roadmaps")

def get_faculty_programs_col():
    return db_manager.get_collection("faculty_programs")

def get_collaborations_col():
    return db_manager.get_collection("collaborations")

def get_notifications_col():
    return db_manager.get_collection("notifications")

def get_chat_sessions_col():
    return db_manager.get_collection("chat_sessions")

def get_chat_messages_col():
    return db_manager.get_collection("chat_messages")

def get_audit_logs_col():
    return db_manager.get_collection("audit_logs")
