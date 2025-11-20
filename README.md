
# TinyLink

TinyLink is a simple URL shortening service built with **Node.js**, **Express.js**, and **PostgreSQL** (Neon).  
It allows you to create short links, track clicks, view link stats, and check system health.

---

## Features

- Create short URLs with optional custom codes
- Prevent duplicate URLs or codes
- Dashboard to list all links
- Delete links
- View stats for a single link (`/code/:code`)
- Redirect short links (`/:code`)
- Health check endpoint (`/healthz`)
- Strict URL validation (blocks invalid or numeric-only domains)
- Friendly success/error messages

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL (Neon)
- EJS (for dashboard views)
- nanoid (for generating unique codes)

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/YourUsername/YourRepoName.git
cd YourRepoName
````

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
DATABASE_URL=your_database_connection_string
PORT=3000
```

4. Start the server:

```bash
npm start
```

5. Visit:

* Dashboard: `http://localhost:3000/`
* Health check: `http://localhost:3000/healthz`

---

## API Endpoints

| Method | Path        | Description                   |
| ------ | ----------- | ----------------------------- |
| GET    | /           | Dashboard - list all links    |
| POST   | /shorten    | Create a new short link       |
| POST   | /delete/:id | Delete a link by ID           |
| GET    | /code/:code | Stats for a single short link |
| GET    | /:code      | Redirect to original URL      |
| GET    | /healthz    | Health check endpoint         |

---

## License

MIT License

```

---

This README will:

1. Explain the **project purpose & features**  
2. Include **setup instructions**  
3. Document **all endpoints** clearly  
4. Be **professional and GitHub-ready**

---

If you want, I can also make a **shorter version with badges, screenshots, and example dashboard view** to make it look very professional on GitHub.  

Do you want me to do that?
```
