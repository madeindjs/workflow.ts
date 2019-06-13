// lib/server.ts
import app from "./app";
const PORT = process.env.PORT || 3000;


app.listen(PORT, () =>
    console.log(`Example app listening on port ${PORT}!`),
);