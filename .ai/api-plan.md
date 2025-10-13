# REST API Plan

## 1. Resources

- **Decks**: Represents a collection of flashcards. Corresponds to the `decks` table.
- **Flashcards**: Represents a single flashcard with a front and back. Corresponds to the `flashcards` table.
- **AI**: A functional resource for handling AI-powered operations, primarily flashcard generation.

## 2. Endpoints

All endpoints are prefixed with `/api`.

---

### 2.1. Decks

#### List Decks

- **Method**: `GET`
- **Path**: `/decks`
- **Description**: Retrieves a list of all decks belonging to the authenticated user.
- **Query Parameters**:
  - `page` (number, optional, default: 1): The page number for pagination.
  - `limit` (number, optional, default: 20): The number of decks per page.
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**: 
    ```json
    {
      "data": [
        {
          "id": "uuid-string-1",
          "name": "React Hooks",
          "createdAt": "2023-10-27T10:00:00Z",
          "flashcardCount": 15
        },
        {
          "id": "uuid-string-2",
          "name": "Advanced TypeScript",
          "createdAt": "2023-10-26T15:30:00Z",
          "flashcardCount": 42
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 3,
        "totalItems": 58
      }
    }
    ```
- **Error Responses**:
  - `401 Unauthorized`: If the user is not authenticated.

---

#### Create Deck

- **Method**: `POST`
- **Path**: `/decks`
- **Description**: Creates a new deck for the authenticated user.
- **Request Body**:
  ```json
  {
    "name": "New Deck Name"
  }
  ```
- **Success Response**:
  - **Code**: `201 Created`
  - **Content**:
    ```json
    {
      "id": "new-uuid-string",
      "name": "New Deck Name",
      "createdAt": "2023-10-27T11:00:00Z",
      "flashcardCount": 0
    }
    ```
- **Error Responses**:
  - `400 Bad Request`: If the `name` is missing or empty.
  - `401 Unauthorized`: If the user is not authenticated.

---

#### Get Deck Details

- **Method**: `GET`
- **Path**: `/decks/{deckId}`
- **Description**: Retrieves details for a specific deck, including all its flashcards.
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "id": "uuid-string-1",
      "name": "React Hooks",
      "createdAt": "2023-10-27T10:00:00Z",
      "flashcards": [
        {
          "id": "flashcard-uuid-1",
          "front": "What is `useState`?",
          "back": "A Hook that lets you add React state to function components.",
          "source": "manual",
          "createdAt": "2023-10-27T10:05:00Z"
        }
      ]
    }
    ```
- **Error Responses**:
  - `401 Unauthorized`: If the user is not authenticated.
  - `404 Not Found`: If the deck does not exist or the user does not have access.

---

#### Update Deck

- **Method**: `PATCH`
- **Path**: `/decks/{deckId}`
- **Description**: Updates the name of a specific deck.
- **Request Body**:
  ```json
  {
    "name": "Updated Deck Name"
  }
  ```
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "id": "uuid-string-1",
      "name": "Updated Deck Name",
      "createdAt": "2023-10-27T10:00:00Z",
      "updatedAt": "2023-10-27T11:30:00Z"
    }
    ```
- **Error Responses**:
  - `400 Bad Request`: If the `name` is empty.
  - `401 Unauthorized`: If the user is not authenticated.
  - `404 Not Found`: If the deck does not exist or the user does not have access.

---

#### Delete Deck

- **Method**: `DELETE`
- **Path**: `/decks/{deckId}`
- **Description**: Deletes a specific deck and all flashcards within it (due to `ON DELETE CASCADE`).
- **Success Response**:
  - **Code**: `204 No Content`
- **Error Responses**:
  - `401 Unauthorized`: If the user is not authenticated.
  - `404 Not Found`: If the deck does not exist or the user does not have access.

---

### 2.2. Flashcards

#### Create Flashcard

- **Method**: `POST`
- **Path**: `/decks/{deckId}/flashcards`
- **Description**: Creates a new flashcard within a specified deck. Supports both manual creation and AI-generated flashcards.
- **Request Body**:
  ```json
  {
    "front": "What is `useEffect`?",
    "back": "A Hook for performing side effects in function components.",
    "source": "manual"
  }
  ```
- **Request Body Validation**:
  - `front` (required): String, max 200 characters
  - `back` (required): String, max 500 characters
  - `source` (required): One of: "manual", "ai-full", "ai-edited"
- **Success Response**:
  - **Code**: `201 Created`
  - **Content**:
    ```json
    {
      "id": "new-flashcard-uuid",
      "deckId": "uuid-string-1",
      "front": "What is `useEffect`?",
      "back": "A Hook for performing side effects in function components.",
      "source": "manual",
      "createdAt": "2023-10-27T12:00:00Z"
    }
    ```
- **Error Responses**:
  - `400 Bad Request`: If:
    - `front` or `back` are missing or empty
    - `front` exceeds 200 characters
    - `back` exceeds 500 characters
    - `source` is not one of the allowed values
  - `401 Unauthorized`: If the user is not authenticated.
  - `404 Not Found`: If the deck does not exist or the user does not have access.

---

#### Update Flashcard

- **Method**: `PATCH`
- **Path**: `/flashcards/{flashcardId}`
- **Description**: Updates the content of a specific flashcard.
- **Request Body**:
  ```json
  {
    "front": "Updated Question?",
    "back": "Updated Answer."
  }
  ```
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "id": "flashcard-uuid-1",
      "deckId": "uuid-string-1",
      "front": "Updated Question?",
      "back": "Updated Answer.",
      "source": "manual",
      "updatedAt": "2023-10-27T12:30:00Z"
    }
    ```
- **Error Responses**:
  - `400 Bad Request`: If `front` or `back` exceed length limits.
  - `401 Unauthorized`: If the user is not authenticated.
  - `404 Not Found`: If the flashcard does not exist or the user does not have access.

---

#### Delete Flashcard

- **Method**: `DELETE`
- **Path**: `/flashcards/{flashcardId}`
- **Description**: Deletes a specific flashcard.
- **Success Response**:
  - **Code**: `204 No Content`
- **Error Responses**:
  - `401 Unauthorized`: If the user is not authenticated.
  - `404 Not Found`: If the flashcard does not exist or the user does not have access.

---

### 2.3. AI Operations

#### Generate Flashcard Candidates

- **Method**: `POST`
- **Path**: `/ai/generate-flashcards`
- **Description**: Submits source text to an AI model to generate flashcard suggestions. It creates a `generation` entry in the `generations` table to track the generation process and returns the candidates along with a `generationId`.
- **Request Body**:
  ```json
  {
    "sourceText": "A long string of text between 1000 and 10000 characters..."
  }
  ```
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "generationId": "new-generation-uuid",
      "candidates": [
        {
          "front": "AI Generated Question 1",
          "back": "AI Generated Answer 1"
        },
        {
          "front": "AI Generated Question 2",
          "back": "AI Generated Answer 2"
        }
      ]
    }
    ```
- **Error Responses**:
  - `400 Bad Request`: If `sourceText` is missing or does not meet the length requirements.
  - `401 Unauthorized`: If the user is not authenticated.
  - `429 Too Many Requests`: If the user exceeds the rate limit for this endpoint.
  - `500 Internal Server Error`: If the AI service fails.

---

#### Batch Create AI-Generated Flashcards

- **Method**: `POST`
- **Path**: `/decks/{deckId}/flashcards/batch`
- **Description**: Creates multiple flashcards in a specified deck from a list of AI-generated candidates. It links them to an existing generation session via `generationId` and updates the metrics for that session.
- **Request Body**:
  ```json
  {
    "generationId": "existing-generation-uuid",
    "flashcards": [
      {
        "front": "AI Generated Question 1",
        "back": "AI Generated Answer 1",
        "source": "ai-full"
      },
      {
        "front": "User Edited Question 2",
        "back": "User Edited Answer 2",
        "source": "ai-edited"
      }
    ]
  }
  ```
- **Success Response**:
  - **Code**: `201 Created`
  - **Content**:
    ```json
    {
      "createdCount": 2,
      "generationId": "existing-generation-uuid"
    }
    ```
- **Error Responses**:
  - `400 Bad Request`: If request body is malformed or validation for any flashcard fails.
  - `401 Unauthorized`: If the user is not authenticated.
  - `404 Not Found`: If the specified `deckId` or `generationId` does not exist or belong to the user.



## 3. Validation and Business Logic

- **Deck Validation**:
  - `name`: Must be a non-empty string.
- **Flashcard Validation**:
  - `front`: Required, non-empty, max 200 characters.
  - `back`: Required, non-empty, max 500 characters.
  - `source`: Must be one of `'manual'`, `'ai-full'`, or `'ai-edited'`.
- **AI Generation Validation**:
  - `sourceText`: Required, string, length between 1000 and 10000 characters.
- **Business Logic**:
  - **Cascading Deletes**: Deleting a deck (`DELETE /decks/{deckId}`) will automatically delete all associated flashcards, as defined by the `ON DELETE CASCADE` foreign key constraint in the database.
  - **Metrics Logging**: The `POST /ai/generate-flashcards` endpoint creates a `generations` log entry. The `POST /decks/{deckId}/flashcards/batch` endpoint updates this entry with the final count of accepted and edited flashcards. This allows tracking the entire lifecycle of an AI generation task.
  - **Rate Limiting**: The computationally expensive `POST /ai/generate-flashcards` endpoint should be rate-limited to prevent abuse and control costs. A limit of 10 requests per minute per user is recommended as a starting point.
