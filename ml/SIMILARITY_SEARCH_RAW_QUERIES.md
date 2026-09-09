# Raw SQL Queries for Similarity Search

## Overview
These are the actual raw PostgreSQL queries used in the application for vector similarity search using pgvector extension.

---

## Query 1: Basic Similarity Search (findSimilar)
**Used in:** Image search, product recommendations  
**Files:** `backend/src/models/ProductEmbedding.js` (line 100)

```sql
SELECT 
  p.id,
  p.name,
  p.price,
  p.category,
  p.imageurl,
  p.description,
  1 - (pe.embedding <=> $1::vector) as similarity
FROM products p
JOIN product_embeddings pe ON p.id = pe.product_id
ORDER BY pe.embedding <=> $1::vector
LIMIT $2;
```

**Parameters:**
- `$1` = embedding vector (JSON stringified array of 2048 floats)
- `$2` = top_n limit (default: 10)

**What it does:**
- Joins products with their embeddings
- Calculates L2 Euclidean distance between query embedding and stored embeddings
- Converts distance to similarity score: `1 - distance`
- Returns top N most similar products

**Example Response:**
```json
[
  {
    "id": 5,
    "name": "Blue Backpack",
    "price": "69.99",
    "category": "bags",
    "imageurl": "uploads/1788950782120-967666630.jpg",
    "description": "Durable travel backpack",
    "similarity": 0.95
  },
  {
    "id": 3,
    "name": "Shoulder Bag",
    "price": "45.99",
    "category": "bags",
    "imageurl": "uploads/1788950835742-649223336.jpg",
    "description": "Stylish shoulder bag",
    "similarity": 0.87
  }
]
```

---

## Query 2: Similarity Search with Threshold (findSimilarWithThreshold)
**Used in:** Filtering products by minimum similarity  
**Files:** `backend/src/models/ProductEmbedding.js` (line 127)

```sql
SELECT 
  p.id,
  p.name,
  p.price,
  p.category,
  p.imageurl,
  p.description,
  1 - (pe.embedding <=> $1::vector) as similarity
FROM products p
JOIN product_embeddings pe ON p.id = pe.product_id
WHERE 1 - (pe.embedding <=> $1::vector) > $2
ORDER BY similarity DESC
LIMIT $3;
```

**Parameters:**
- `$1` = embedding vector (JSON stringified array of 2048 floats)
- `$2` = similarity_threshold (default: 0.7, range: 0-1)
- `$3` = limit (default: 20)

**What it does:**
- Only returns products with similarity score above threshold
- Useful to exclude loosely related products
- Sorts by similarity (highest first)

**Example Threshold Values:**
- `> 0.9` = Very similar (nearly identical)
- `> 0.7` = Similar (good matches)
- `> 0.5` = Somewhat similar (broader matches)
- `> 0.3` = Loosely related

---

## Query 3: Raw Vector Distance Calculation
**Used in:** Advanced similarity analysis

```sql
SELECT 
  p.id,
  p.name,
  (pe.embedding <=> '[embedding_vector]'::vector) as distance,
  1 - (pe.embedding <=> '[embedding_vector]'::vector) as similarity_score
FROM products p
JOIN product_embeddings pe ON p.id = pe.product_id
ORDER BY distance ASC
LIMIT 10;
```

**Distance vs Similarity:**
- **Distance** (using `<=>` operator): 0 = identical, 2 = completely different
- **Similarity** (1 - distance): 0 = different, 1 = identical

---

## Query 4: Get Embeddings Only
**Used in:** Comparison operations

```sql
SELECT pe.product_id, pe.embedding
FROM product_embeddings pe
JOIN products p ON p.id = pe.product_id;
```

---

## Query 5: Count Similar Products
**Used in:** Analytics, statistics

```sql
SELECT 
  COUNT(*) as similar_count,
  AVG(1 - (pe.embedding <=> $1::vector)) as avg_similarity,
  MIN(1 - (pe.embedding <=> $1::vector)) as min_similarity,
  MAX(1 - (pe.embedding <=> $1::vector)) as max_similarity
FROM products p
JOIN product_embeddings pe ON p.id = pe.product_id
WHERE 1 - (pe.embedding <=> $1::vector) > $2;
```

---

## PGVector Operators Explained

### `<=>` (L2 Euclidean Distance)
```sql
pe.embedding <=> query_embedding::vector
```
- **Most common** for image embeddings
- Measures straight-line distance in vector space
- Good for ResNet50 embeddings (used in this project)
- Range: 0 (identical) to 2 (completely different)

### `<#>` (Max Inner Product Distance)
```sql
pe.embedding <#> query_embedding::vector
```
- Used for normalized vectors
- Measures projection/angle between vectors
- Good for cosine similarity

### `<<>>` (Cosine Distance)
```sql
pe.embedding <<>> query_embedding::vector
```
- Normalized angular distance
- Treats vectors as directions regardless of magnitude
- Values: 0 (identical direction) to 2 (opposite direction)

---

## Column Information

### products table
- `id` - Product ID (primary key)
- `name` - Product name
- `price` - Product price (NUMERIC)
- `category` - Product category
- `imageurl` - Image path (lowercase, PostgreSQL automatic)
- `description` - Product description
- `created_at` - Creation timestamp

### product_embeddings table
- `id` - Embedding record ID
- `product_id` - Foreign key to products
- `embedding` - Vector(2048) - ResNet50 embedding (2048 dimensions)

**Important:** PostgreSQL stores unquoted column names as LOWERCASE
- Column defined as `imageUrl` → stored as `imageurl`
- Column defined as `productId` → stored as `product_id`

---

## Embedding Format

Embeddings are stored as **vector(2048)** - 2048-dimensional vectors from ResNet50 model.

**When sending to database:**
```javascript
// Frontend sends binary image
const imageResponse = await axios.post('/extract', formData);

// Backend receives and parses embedded vector
const embedding = response.data.embedding; // Array of 2048 floats

// Database stores as PostgreSQL vector type
JSON.stringify(embedding) // Converted to JSON for storage
```

---

## Performance Optimization

### For Large Datasets, Create Indexes

```sql
-- IVFFlat Index (good for large datasets, ~1M+ vectors)
CREATE INDEX ON product_embeddings USING ivfflat 
  (embedding vector_cosine_ops) WITH (lists = 100);

-- HNSW Index (faster, memory-intensive)
CREATE INDEX ON product_embeddings USING hnsw 
  (embedding vector_cosine_ops);

-- Without index (fine for small datasets <10k)
-- Sequential scan is used by default
```

---

## Testing Queries in psql

```bash
# Connect to database
psql -U postgres -d project_db

# Test raw query with sample embedding
SELECT 
  p.id,
  p.name,
  1 - (pe.embedding <=> '[0.1, 0.2, 0.3, ...(2048 values)]'::vector) as similarity
FROM products p
JOIN product_embeddings pe ON p.id = pe.product_id
ORDER BY pe.embedding <=> '[0.1, 0.2, 0.3, ...(2048 values)]'::vector
LIMIT 10;

# Check embeddings exist
SELECT COUNT(*) as embedding_count FROM product_embeddings;

# Check vector dimensions
SELECT id, array_length(embedding::float4[], 1) as dimension FROM product_embeddings LIMIT 1;
```

---

## Example Flow

1. **User uploads image** → Frontend
2. **Frontend sends to FastAPI** → `/extract` endpoint
3. **FastAPI extracts embedding** → ResNet50 outputs 2048-dim vector
4. **Backend receives embedding** → JSON array of 2048 floats
5. **Database query executes** → Compares with all stored embeddings
6. **Results returned** → Top 10 similar products with similarity scores
7. **Frontend displays** → Product cards sorted by similarity
