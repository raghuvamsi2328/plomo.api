# Plomo API

Node.js + Express API for parent and kid task management, with PostgreSQL and Docker deployment.

## Tech Stack

- Node.js
- Express
- PostgreSQL
- JWT authentication
- Docker + Docker Compose

## APIs Implemented

1. `POST /api/auth/signin`
- Request:
```json
{
  "username": "raghu_parent",
  "childType": "boy",
  "parentName": "Raghu",
  "mobileNumber": "9876543210",
  "dateOfBirth": "05/04/2018",
  "password": "secret123"
}
```

2. `POST /api/auth/login`
- Request (username or mobile in identifier):
```json
{
  "identifier": "raghu_parent",
  "password": "secret123"
}
```

3. `POST /api/auth/kid-login`
- Request:
```json
{
  "kidName": "Aarav",
  "dateOfBirth": "05/04/2018"
}
```

4. `POST /api/tasks`
- Header: `Authorization: Bearer <parent-token>`
- Request:
```json
{
  "parentName": "Raghu",
  "mobileNumber": "9876543210",
  "kidName": "Aarav",
  "taskType": "study",
  "taskTitle": "Math homework",
  "taskDescription": "Complete chapter 2 exercises",
  "taskPoints": 10,
  "taskStatus": "new"
}
```

5. `POST /api/tasks/list`
- Header: `Authorization: Bearer <parent-token>`
- Request:
```json
{
  "parentName": "Raghu",
  "mobileNumber": "9876543210",
  "kidName": "Aarav"
}
```

## Supporting API

Because kid login requires kid name + DOB, a supporting kid profile endpoint is included:

`POST /api/kids`
- Header: `Authorization: Bearer <parent-token>`
- Request:
```json
{
  "kidName": "Aarav",
  "childType": "boy",
  "dateOfBirth": "05/04/2018"
}
```

## Date Format

All kid date inputs must use `dd/mm/yyyy` format.

## Run with Docker

1. Create env file:
```bash
cp .env.example .env
```

2. Start containers:
```bash
docker compose up --build
```

3. Health check:
```bash
curl http://localhost:3000/health
```

4. Open API docs page in browser:
```bash
http://localhost:3000/docs
```

5. Download Postman collection:
```bash
http://localhost:3000/docs/plomo-api.postman_collection.json
```

## Postman Quick Use

1. Import collection file from `public/plomo-api.postman_collection.json`.
2. Run `Auth -> Parent Login (Get Token)`.
3. Token is automatically saved in collection variable `parentToken`.
4. Use protected requests under `Kids` and `Tasks` folders.

## Run locally (without Docker)

1. Install dependencies:
```bash
npm install
```

2. Set env values in `.env`.

3. Start dev server:
```bash
npm run dev
```
