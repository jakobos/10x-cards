# PostgreSQL Database Plan for 10x-cards Application

## 1. Table List with Columns, Data Types, and Constraints

### Table `profiles`

Stores public user data, extending the `auth.users` table from Supabase.

| Column Name | Data Type | Constraints |
| :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, `REFERENCES auth.users(id) ON DELETE CASCADE` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |

### Table `decks`

Stores flashcard decks created by users.

| Column Name | Data Type | Constraints |
| :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| `user_id` | `UUID` | `NOT NULL`, `REFERENCES auth.users(id) ON DELETE CASCADE` |
| `name` | `TEXT` | `NOT NULL`, `CHECK (name <> '')` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |

### Table `generations`

Logs metadata for each AI flashcard generation operation to collect metrics.

| Column Name | Data Type | Constraints |
| :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| `user_id` | `UUID` | `NOT NULL`, `REFERENCES auth.users(id) ON DELETE CASCADE` |
| `model` | `TEXT` | `NULL` |
| `generated_count` | `INTEGER` | `NOT NULL` |
| `accepted_unedited_count` | `INTEGER` | `NULLABLE` |
| `accepted_edited_count` | `INTEGER` | `NULLABLE` |
| `source_text_hash` | `TEXT` | `NOT NULL` |
| `source_text_length` | `INTEGER` | `NOT NULL`, `CHECK (source_text_length >= 1000 AND source_text_length <= 10000)` |
| `generation_duration` | `INTEGER` | `NULL` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |

### Table `flashcards`

The main table for storing individual flashcards.

| Column Name | Data Type | Constraints |
| :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| `deck_id` | `UUID` | `NOT NULL`, `REFERENCES decks(id) ON DELETE CASCADE` |
| `generation_id` | `UUID` | `NULL`, `REFERENCES generations(id) ON DELETE SET NULL` |
| `front` | `VARCHAR(200)` | `NOT NULL` |
| `back` | `VARCHAR(500)` | `NOT NULL` |
| `source` | `TEXT`| `NOT NULL`, `CHECK (source IN ('manual', 'ai-full', 'ai-edited'))` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` |

## 2. Table Relationships

- **`auth.users` -> `profiles` (one-to-one)**
  - Each user in `auth.users` has exactly one profile in `profiles`. The `profiles.id` key is both a primary and foreign key.

- **`auth.users` -> `decks` (one-to-many)**
  - A user can own multiple decks, but each deck belongs to one user.

- **`auth.users` -> `generations` (one-to-many)**
  - A user can perform multiple AI flashcard generation operations.

- **`decks` -> `flashcards` (one-to-many)**
  - A deck can contain multiple flashcards, but each flashcard belongs to one deck.

- **`generations` -> `flashcards` (one-to-many, optional)**
  - The result of one generation operation can be multiple flashcards. The relationship is optional because flashcards can be created manually.

## 3. Indexes

Indexes will be created to optimize query performance on foreign keys. Primary keys are automatically indexed.

```sql
-- Indexes for the decks table
CREATE INDEX idx_decks_user_id ON decks(user_id);

-- Indexes for the generations table
CREATE INDEX idx_generations_user_id ON generations(user_id);

-- Indexes for the flashcards table
CREATE INDEX idx_flashcards_deck_id ON flashcards(deck_id);
CREATE INDEX idx_flashcards_generation_id ON flashcards(generation_id);
```

## 4. PostgreSQL Policies (Row Level Security)

RLS will be enabled to ensure that users can only access their own data.

### `profiles` Table
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);
```

### `decks` Table
```sql
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own decks"
ON decks FOR ALL
USING (auth.uid() = user_id);
```

### `generations` Table
```sql
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own generation logs"
ON generations FOR ALL
USING (auth.uid() = user_id);
```

### `flashcards` Table
```sql
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage flashcards in their own decks"
ON flashcards FOR ALL
USING ((
  SELECT user_id FROM decks WHERE id = deck_id
) = auth.uid());
```

## 5. Additional Notes and Explanations

- **Automatic `updated_at`**: It is recommended to create a function and trigger in PostgreSQL to automatically update the `updated_at` column on every row modification.
  ```sql
  CREATE OR REPLACE FUNCTION handle_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  
  -- The trigger should be added to every table with an updated_at column
  CREATE TRIGGER on_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

  CREATE TRIGGER on_updated_at
  BEFORE UPDATE ON decks
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

  CREATE TRIGGER on_updated_at
  BEFORE UPDATE ON generations
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

  CREATE TRIGGER on_updated_at
  BEFORE UPDATE ON flashcards
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
  ```

- **Foreign Keys `ON DELETE`**: As per the decisions, foreign keys use `ON DELETE CASCADE` (e.g., deleting a deck deletes its flashcards) or `ON DELETE SET NULL` (deleting a generation log does not delete the flashcards, it only nullifies the link), which simplifies application logic and ensures data integrity.
- **`auth.users` Table**: This is managed by Supabase Auth and does not need to be created. It serves as the central reference for user identity.
