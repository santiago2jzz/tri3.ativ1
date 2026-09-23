import { db } from "./db.ts";

const srv = Bun.serve({
  port: 3000,
  routes: {
    "/user": {
      GET: (req) => {
        const query = db.query(`
          SELECT * FROM USERS
        `);
        const data = query.all();
        return Response.json({ data });
      },
      POST: async (req) => {
        const body = await req.json();

        // validação básica
        if (!body.username || !body.email || !body.password) {
          return Response.json(
            { error: "username, email e password são obrigatórios" },
            { status: 400 }
          );
        }

        const query = db.query(`
          INSERT INTO USERS (username, email, password_hash)
          VALUES (:username, :email, :password_hash)
        `);

        const dbResp = query.run({
          ":username": body.username,
          ":email": body.email,
          ":password_hash": body.password,
        });

        return Response.json({
          message: "deu boa",
          dbResp,
        });
      },
    },

    "/user/:id": {
      GET: (req) => {
        const id = req.params.id;
        const query = db.query(`
          SELECT * FROM users WHERE id = :id
        `);
        const data = query.get({ ":id": id });
        return Response.json({ data });
      },

      PUT: async (req) => {                       // ← agora é async
        const id = req.params.id;
        const body = await req.json();            // ← await aqui

        const query = db.query(`
          UPDATE users
          SET username = :username,
              email = :email,
              password_hash = :password_hash
          WHERE id = :id
        `);

        const dbResp = query.run({
          ":username": body.username,
          ":email": body.email,
          ":password_hash": body.password,
          ":id": id,
        });

        return Response.json({
          message: "deu boa",
          dbResp,
        });
      },

      DELETE: () => Response.json({ message: "não implementado" }, { status: 501 }),
    },
  },

  // fallback: qualquer rota desconhecida devolve JSON em vez de HTML
  fetch(req) {
    return Response.json(
      { error: "Rota não encontrada", path: new URL(req.url).pathname },
      { status: 404 }
    );
  },
});

console.log(`servidor em ${srv.url}`);