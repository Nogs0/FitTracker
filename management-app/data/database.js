import * as SQLite from "expo-sqlite";

let db;

// 🔹 Inicializa banco e tabelas
export const initDB = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("gerenciadorDeColetas.db");

    // Cria tabela de usuários
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        idade INTEGER NOT NULL
      );
    `);

    // Cria tabela de atividades
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS atividades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL
      );
    `);
  }
  return db;
};

//
// ------------------ USUÁRIOS ------------------
//

// Inserir usuário
export const insertUsuario = async (nome, idade) => {
  const database = await initDB();
  return await database.runAsync(
    "INSERT INTO usuarios (nome, idade) VALUES (?, ?);",
    [nome, idade]
  );
};

// Buscar usuários
export const getUsuarios = async () => {
  const database = await initDB();
  return await database.getAllAsync("SELECT * FROM usuarios;");
};

// Atualizar usuário
export const updateUsuario = async (id, nome, idade) => {
  const database = await initDB();
  return await database.runAsync(
    "UPDATE usuarios SET nome = ?, idade = ? WHERE id = ?;",
    [nome, idade, id]
  );
};

// Excluir usuário
export const deleteUsuario = async (id) => {
  const database = await initDB();
  return await database.runAsync("DELETE FROM usuarios WHERE id = ?;", [id]);
};

//
// ------------------ ATIVIDADES ------------------
//

// Inserir atividade
export const insertAtividade = async (nome) => {
  const database = await initDB();
  return await database.runAsync(
    "INSERT INTO atividades (nome) VALUES (?);",
    [nome]
  );
};

// Buscar atividades
export const getAtividades = async () => {
  const database = await initDB();
  return await database.getAllAsync("SELECT * FROM atividades;");
};

// Atualizar atividade
export const updateAtividade = async (id, nome) => {
  const database = await initDB();
  return await database.runAsync(
    "UPDATE atividades SET nome = ? WHERE id = ?;",
    [nome, id]
  );
};

// Excluir atividade
export const deleteAtividade = async (id) => {
  const database = await initDB();
  return await database.runAsync("DELETE FROM atividades WHERE id = ?;", [id]);
};
