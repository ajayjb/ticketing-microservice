# Mongoose — Complete Developer Guide

A comprehensive reference for working with Mongoose and MongoDB in Node.js backends.

---

## Table of Contents

1. [Schema](#1-schema)
2. [Model](#2-model)
3. [Document](#3-document)
4. [Schema vs Model vs Document](#4-schema-vs-model-vs-document)
5. [lean() vs Document](#5-lean-vs-document)
6. [save() vs updateOne()](#6-save-vs-updateone)
7. [Static vs Instance Methods](#7-static-vs-instance-methods)
8. [Virtual Fields](#8-virtual-fields)
9. [populate() — Joins](#9-populate--joins)
10. [Indexes](#10-indexes)
11. [Hooks (Middleware)](#11-hooks-middleware)
12. [Transactions](#12-transactions)
13. [Aggregation Pipelines](#13-aggregation-pipelines)
14. [Error Handling](#14-error-handling)
15. [Production Hook Patterns](#15-production-hook-patterns)
16. [Common Mistakes](#16-common-mistakes)
17. [Quick Reference](#17-quick-reference)

---

## 1. Schema

A Schema defines the **structure, types, defaults, and validation rules** for documents.

```js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  age:      { type: Number, min: 0, max: 120 },
  role:     { type: String, enum: ["user", "admin"], default: "user" },
  isActive: { type: Boolean, default: true },
  tags:     [String],
  address: {
    city:    String,
    country: String
  },
  createdAt: { type: Date, default: Date.now }
});
```

### Schema Types

| Type | Example |
|---|---|
| `String` | `"Ajay"` |
| `Number` | `25` |
| `Boolean` | `true` |
| `Date` | `new Date()` |
| `ObjectId` | `mongoose.Types.ObjectId` |
| `Array` | `[String]` |
| `Mixed` | `Schema.Types.Mixed` |
| `Map` | `Map` |

### Schema Options

```js
const userSchema = new mongoose.Schema(
  { name: String },
  {
    timestamps: true,       // adds createdAt, updatedAt
    versionKey: false,      // removes __v field
    collection: "users",    // custom collection name
    strict: true            // ignores unknown fields (default: true)
  }
);
```

---

## 2. Model

A Model is a **class created from a Schema**. It maps to a MongoDB collection and provides all CRUD operations.

```js
const User = mongoose.model("User", userSchema);
// → collection name becomes "users" (lowercased + pluralized)
```

### CRUD Operations

```js
// Create
const user = await User.create({ name: "Ajay", age: 25 });
await new User({ name: "Ajay" }).save();

// Read
const all   = await User.find();
const one   = await User.findById(id);
const match = await User.findOne({ email: "ajay@example.com" });

// Update
await User.updateOne({ _id: id }, { name: "Ajay JB" });
await User.updateMany({ role: "user" }, { isActive: true });
const updated = await User.findByIdAndUpdate(id, { name: "Ajay" }, { new: true });

// Delete
await User.deleteOne({ _id: id });
await User.deleteMany({ isActive: false });
await User.findByIdAndDelete(id);

// Count
const total = await User.countDocuments({ role: "admin" });
```

### Query Chaining

```js
const users = await User
  .find({ isActive: true })
  .select("name email")       // only return these fields
  .sort({ createdAt: -1 })    // newest first
  .skip(20)                   // pagination offset
  .limit(10);                 // page size
```

---

## 3. Document

A Document is an **instance of a Model** — one record in the collection.

```js
const user = new User({ name: "Ajay", age: 25 });
```

### Document Methods

```js
await user.save();          // save to DB
await user.deleteOne();     // delete this document
user.toObject();            // convert to plain JS object
user.toJSON();              // convert for JSON serialization
await user.validate();      // manually run validation

user.isModified("name");    // check if field was changed
user.isNew;                 // true if not yet saved to DB
user.get("name");           // getter
user.set("name", "Ajay");   // setter
```

---

## 4. Schema vs Model vs Document

| Feature | Schema | Model | Document |
|---|---|---|---|
| What it is | Blueprint | Class / DB interface | Instance / Record |
| Created from | — | Schema | Model |
| Used for | Defining structure | DB operations | Data manipulation |
| Example | `userSchema` | `User` | `user` |

```
Schema → Model → Document → MongoDB
```

**Real-life analogy:**

```
Schema   = Building blueprint
Model    = The construction company (knows how to build)
Document = The actual house
```

---

## 5. `.lean()` vs Document

### Without `.lean()` — Mongoose Document
```js
const users = await User.find();
// Returns full Mongoose Documents with methods:
// .save(), .validate(), .toObject(), getters, setters, virtuals
```

### With `.lean()` — Plain JS Object
```js
const users = await User.find().lean();
// Returns: [{ _id: "...", name: "Ajay", age: 25 }]
// No Mongoose methods. Faster.
```

**Performance improvement: 30–50% on large result sets.**

| | Document | `.lean()` |
|---|---|---|
| Mongoose methods | ✅ | ❌ |
| Virtuals | ✅ | ❌ (unless configured) |
| Speed | Normal | 30–50% faster |
| Memory usage | Higher | Lower |

✅ Use `.lean()` for: API responses, read-only data, large lists  
❌ Avoid `.lean()` when: you need to call `.save()`, use virtuals, or run instance methods

---

## 6. `save()` vs `updateOne()`

### `save()`
```js
const user = await User.findById(id);
user.name = "Ajay JB";
await user.save();
```
Steps internally: **fetch → modify → validate → run hooks → save**

### `updateOne()`
```js
await User.updateOne({ _id: id }, { $set: { name: "Ajay JB" } });
```
Direct DB update. No fetch, limited hooks.

| Feature | `save()` | `updateOne()` |
|---|---|---|
| Fetches document first | Yes | No |
| Schema validation | Yes | No (unless `runValidators: true`) |
| Runs middleware/hooks | Yes | Limited |
| Performance | Slower | Faster |
| Best for | Complex updates | Simple, bulk updates |

```js
// Enable validation with updateOne
await User.updateOne(
  { _id: id },
  { $set: { age: -5 } },
  { runValidators: true }  // will throw error if age < 0
);
```

---

## 7. Static vs Instance Methods

### Instance Methods — called on a **document**

```js
userSchema.methods.isAdult = function () {
  return this.age >= 18;
};

userSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

// Usage
const user = await User.findById(id);
console.log(user.isAdult());      // true / false
console.log(user.getFullName());  // "Ajay JB"
```

### Static Methods — called on the **model**

```js
userSchema.statics.findAdults = function () {
  return this.find({ age: { $gte: 18 } });
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

// Usage
const adults = await User.findAdults();
const user   = await User.findByEmail("ajay@example.com");
```

| Type | Called on | `this` refers to |
|---|---|---|
| Instance | Document | The document |
| Static | Model | The model |

---

## 8. Virtual Fields

Virtuals are **computed fields** that are not stored in MongoDB — they're derived from existing data.

```js
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual("profileUrl").get(function () {
  return `/users/${this._id}`;
});
```

### Usage

```js
const user = await User.findById(id);
console.log(user.fullName);   // "Ajay JB"
console.log(user.profileUrl); // "/users/abc123"
```

### Include Virtuals in JSON

By default, virtuals are excluded from `.toJSON()` and `.toObject()`. Enable them:

```js
const userSchema = new mongoose.Schema(
  { firstName: String, lastName: String },
  {
    toJSON:   { virtuals: true },
    toObject: { virtuals: true }
  }
);
```

### Virtual Populate (reverse reference)

```js
// User has many Posts (without storing postIds on User)
userSchema.virtual("posts", {
  ref:         "Post",
  localField:  "_id",
  foreignField: "user"
});

const user = await User.findById(id).populate("posts");
console.log(user.posts); // array of Post documents
```

---

## 9. `populate()` — Joins

MongoDB has no native joins. Mongoose handles this with `populate`.

### Basic Example

```js
const postSchema = new Schema({
  title: String,
  user: { type: Schema.Types.ObjectId, ref: "User" }
});

const post = await Post.findById(id).populate("user");
// post.user is now the full User document
```

### Select Specific Fields

```js
await Post.find().populate("user", "name email"); // only name and email
```

### Nested Populate

```js
await Post.find()
  .populate({
    path: "user",
    populate: { path: "company" }  // populate user's company too
  });
```

### Multiple Populates

```js
await Post.find()
  .populate("user")
  .populate("category");
```

### Populate with Conditions

```js
await Post.find().populate({
  path: "user",
  match: { isActive: true },  // only populate if user is active
  select: "name"
});
```

> ⚠️ `populate()` runs a **second query** to MongoDB. For large datasets, consider aggregation pipelines instead.

---

## 10. Indexes

Indexes dramatically improve **query performance** but add overhead on writes.

### Single Field Index

```js
userSchema.index({ email: 1 });       // ascending
userSchema.index({ createdAt: -1 });  // descending (useful for sorting)
```

### Unique Index

```js
userSchema.index({ email: 1 }, { unique: true });
// or inline:
email: { type: String, unique: true }
```

### Compound Index

```js
// Optimizes queries that filter by both tenantId AND createdAt
userSchema.index({ tenantId: 1, createdAt: -1 });
```

### Text Index (Full-text search)

```js
postSchema.index({ title: "text", body: "text" });

// Query
await Post.find({ $text: { $search: "mongoose hooks" } });
```

### TTL Index (Auto-expire documents)

```js
// Automatically delete documents after 1 hour
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });
```

### Sparse Index

```js
// Only index documents where the field exists
userSchema.index({ phoneNumber: 1 }, { sparse: true });
```

> 💡 **Rule of thumb:** Index fields that appear in `.find()`, `.sort()`, or `.where()` frequently. Over-indexing slows down writes.

---

## 11. Hooks (Middleware)

Hooks run **before (`pre`)** or **after (`post`)** operations.

### Hook Types

| Hook | Runs When | `this` |
|---|---|---|
| `pre("save")` | Before saving | Document |
| `post("save")` | After saving | Document |
| `pre("validate")` | Before validation | Document |
| `pre("find")` | Before any find | Query |
| `pre("findOne")` | Before findOne | Query |
| `pre("updateOne")` | Before updateOne | Query |
| `pre("deleteOne")` | Before deleteOne | Query |
| `pre(/^find/)` | Before any find* | Query |

### Execution Order

```
pre("validate") → pre("save") → post("validate") → post("save")
```

### Password Hashing Example

```js
import bcrypt from "bcrypt";

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // only hash if changed
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};
```

### Error Handling in Hooks

```js
userSchema.pre("save", function (next) {
  if (!this.email) {
    return next(new Error("Email is required"));
  }
  next();
});
```

### Async Hooks

```js
// Option 1: use next()
userSchema.pre("save", async function (next) {
  await doSomething();
  next();
});

// Option 2: return a promise (no next needed)
userSchema.pre("save", async function () {
  await doSomething();
});
```

> ⚠️ **Always define hooks before calling `mongoose.model()`**

---

## 12. Transactions

Use transactions when **multiple operations must all succeed or all fail** (atomicity).

```js
const session = await mongoose.startSession();
session.startTransaction();

try {
  const user = await User.create([{ name: "Ajay" }], { session });

  await Account.create(
    [{ userId: user[0]._id, balance: 1000 }],
    { session }
  );

  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction(); // rolls back all changes
  throw error;
} finally {
  session.endSession();
}
```

### Bank Transfer Example

```js
async function transfer(fromId, toId, amount) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await Account.updateOne(
      { _id: fromId },
      { $inc: { balance: -amount } },
      { session }
    );

    await Account.updateOne(
      { _id: toId },
      { $inc: { balance: amount } },
      { session }
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}
```

> ⚠️ Transactions require a **MongoDB Replica Set** or **Atlas cluster** (not standalone MongoDB).

---

## 13. Aggregation Pipelines

Aggregation is MongoDB's way to **transform and compute data** — like SQL's `GROUP BY`, `JOIN`, `HAVING`.

```js
const result = await Order.aggregate([
  { $match:  { status: "completed" } },           // filter
  { $group:  { _id: "$userId", total: { $sum: "$amount" } } }, // group
  { $sort:   { total: -1 } },                     // sort
  { $limit:  10 },                                // top 10
  { $lookup: {                                    // join
      from:         "users",
      localField:   "_id",
      foreignField: "_id",
      as:           "user"
  }},
  { $unwind: "$user" },                           // flatten array
  { $project: { "user.name": 1, total: 1 } }      // shape output
]);
```

### Common Pipeline Stages

| Stage | Purpose |
|---|---|
| `$match` | Filter documents |
| `$group` | Group and aggregate |
| `$sort` | Sort results |
| `$limit` | Limit results |
| `$skip` | Skip for pagination |
| `$lookup` | Join with another collection |
| `$unwind` | Flatten array fields |
| `$project` | Shape / rename output fields |
| `$addFields` | Add computed fields |
| `$count` | Count documents |

### Aggregation vs populate()

| | `populate()` | `$lookup` (aggregation) |
|---|---|---|
| Runs | 2 queries | 1 pipeline |
| Flexibility | Limited | High |
| Performance | Slower on large data | Faster |
| Best for | Simple references | Complex joins, reports |

---

## 14. Error Handling

### Validation Errors

```js
try {
  await user.save();
} catch (err) {
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(e => e.message);
    // ["Path `email` is required.", "Age must be positive"]
  }
}
```

### Duplicate Key Error (E11000)

```js
try {
  await User.create({ email: "existing@example.com" });
} catch (err) {
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    console.log(`${field} already exists`);
  }
}
```

### Cast Error (invalid ObjectId)

```js
try {
  await User.findById("not-valid-id");
} catch (err) {
  if (err.name === "CastError") {
    console.log("Invalid ID format");
  }
}
```

### Global Error Map (Express)

```js
function mongooseErrorHandler(err, req, res, next) {
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: "Duplicate entry" });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid ID" });
  }
  next(err);
}
```

---

## 15. Production Hook Patterns

### Soft Delete Filtering

```js
const userSchema = new mongoose.Schema({
  name:      String,
  isDeleted: { type: Boolean, default: false }
});

// Auto-filter deleted records from ALL find queries
userSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

// Soft delete
await User.updateOne({ _id: userId }, { isDeleted: true });
```

---

### Auto Timestamps

```js
// Built-in (recommended)
const userSchema = new mongoose.Schema(
  { name: String },
  { timestamps: true }
);
// Adds: createdAt, updatedAt
```

---

### Audit Logging

```js
const auditSchema = new mongoose.Schema({
  collection: String,
  documentId: mongoose.Types.ObjectId,
  action:     String,
  before:     mongoose.Schema.Types.Mixed,
  after:      mongoose.Schema.Types.Mixed,
  updatedBy:  String,
  timestamp:  { type: Date, default: Date.now }
});

userSchema.post("updateOne", async function () {
  await mongoose.model("Audit").create({
    collection: "users",
    documentId: this.getQuery()._id,
    action:     "update",
    timestamp:  new Date()
  });
});
```

---

### Multi-Tenant Filtering

```js
const orderSchema = new mongoose.Schema({
  product:  String,
  tenantId: { type: String, required: true, index: true }
});

orderSchema.pre(/^find/, function (next) {
  const tenantId = this.options.tenantId;
  if (tenantId) this.where({ tenantId });
  next();
});

// Usage
Order.find().setOptions({ tenantId: "company-abc" });
```

---

### Combined Production Schema

```js
const userSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true },
    email:     { type: String, required: true, unique: true },
    password:  { type: String, required: true },
    role:      { type: String, enum: ["user", "admin"], default: "user" },
    tenantId:  { type: String, index: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true, versionKey: false }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ tenantId: 1, createdAt: -1 });

// Soft delete + multi-tenant auto filter
userSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  const tenantId = this.options.tenantId;
  if (tenantId) this.where({ tenantId });
  next();
});

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method: password check
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Static method: find by tenant
userSchema.statics.findByTenant = function (tenantId) {
  return this.find().setOptions({ tenantId });
};

const User = mongoose.model("User", userSchema);
```

---

## 16. Common Mistakes

### ❌ Mistake 1: Not using `$set` in `updateOne()`

```js
// WRONG — replaces the whole document!
await User.updateOne({ _id: id }, { name: "Ajay" });

// CORRECT — only updates name field
await User.updateOne({ _id: id }, { $set: { name: "Ajay" } });
```

### ❌ Mistake 2: Forgetting hooks don't run on bulk operations

```js
// pre("save") does NOT run here
await User.insertMany([...]);

// pre("updateOne") does NOT run here
await User.updateMany({}, { $set: { isActive: true } });
```

### ❌ Mistake 3: Using `.lean()` then calling document methods

```js
const user = await User.findById(id).lean();
await user.save(); // ❌ TypeError: user.save is not a function
```

### ❌ Mistake 4: Defining hooks after `mongoose.model()`

```js
const User = mongoose.model("User", userSchema);
userSchema.pre("save", () => {}); // ❌ Hook never runs
```

### ❌ Mistake 5: Missing `await` on async hooks

```js
// WRONG — next() called before async work finishes
userSchema.pre("save", function (next) {
  bcrypt.hash(this.password, 10).then(hash => {
    this.password = hash;
  });
  next(); // called too early!
});

// CORRECT
userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

### ❌ Mistake 6: N+1 Query Problem with `populate()`

```js
// WRONG — runs 1 + N queries
const posts = await Post.find();
for (const post of posts) {
  const user = await User.findById(post.userId); // N queries!
}

// CORRECT — runs 2 queries total
const posts = await Post.find().populate("user");
```

### ❌ Mistake 7: No indexes on frequently queried fields

```js
// Slow — full collection scan
await User.find({ email: "ajay@example.com" });

// Fast — after adding: userSchema.index({ email: 1 })
await User.find({ email: "ajay@example.com" });
```

---

## 17. Quick Reference

```
Schema       → defines structure, types, validation
Model        → DB interface (maps to collection)
Document     → one record (instance of Model)

.lean()      → plain JS object, 30-50% faster reads
save()       → fetch + validate + hooks + save
updateOne()  → direct DB write, no fetch, faster

pre hook     → runs BEFORE the operation
post hook    → runs AFTER the operation
pre(/^find/) → matches all find* operations

populate()   → join via reference (2 queries)
$lookup      → join via aggregation (1 pipeline)

index()      → speed up queries on large collections
timestamps   → auto createdAt / updatedAt
transactions → atomic multi-document operations

Flow:
Schema → Model → Document → MongoDB
```

---

*Reference: Mongoose v8.x | MongoDB 7.x | Node.js 20+*
