import * as SQLite from "expo-sqlite";

let _db;

export const getDB = async () => {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync("gerenciadorDeColetas.db");
  }
  return _db;
};

export const initDB = async () => {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync("gerenciadorDeColetas.db");

    // Cria tabela de usuários
    await _db.execAsync(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        idade INTEGER NOT NULL
      );
    `);

    // Cria tabela de atividades
    await _db.execAsync(`
      CREATE TABLE IF NOT EXISTS atividades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL
      );
    `);

    // Cria tabela de coletas
    await _db.execAsync(`
      CREATE TABLE IF NOT EXISTS coletas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nomeUsuario TEXT NOT NULL,
        idadeUsuario TEXT NOT NULL,
        nomeAtividade TEXT NOT NULL,
        horaInicio TEXT NOT NULL,
        horaFim TEXT,
        conexaoEstabelecida INTEGER,
        qtdDadosRecebidos TEXT
      );
    `);
  }
  return _db;
};

//
// ------------------ USUÁRIOS ------------------
//

// Inserir usuário
export const insertUsuario = async (nome, idade) => {
  const database = await getDB();
  return await database.runAsync(
    "INSERT INTO usuarios (nome, idade) VALUES (?, ?);",
    [nome, idade]
  );
};

// Buscar usuários
export const getUsuarios = async () => {
  const database = await getDB();
  return await database.getAllAsync("SELECT * FROM usuarios;");
};

// Atualizar usuário
export const updateUsuario = async (id, nome, idade) => {
  const database = await getDB();
  return await database.runAsync(
    "UPDATE usuarios SET nome = ?, idade = ? WHERE id = ?;",
    [nome, idade, id]
  );
};

// Excluir usuário
export const deleteUsuario = async (id) => {
  const database = await getDB();
  return await database.runAsync("DELETE FROM usuarios WHERE id = ?;", [id]);
};

//
// ------------------ ATIVIDADES ------------------
//

// Inserir atividade
export const insertAtividade = async (nome) => {
  const database = await getDB();
  return await database.runAsync(
    "INSERT INTO atividades (nome) VALUES (?);",
    [nome]
  );
};

// Buscar atividades
export const getAtividades = async () => {
  const database = await getDB();
  return await database.getAllAsync("SELECT * FROM atividades;");
};

// Atualizar atividade
export const updateAtividade = async (id, nome) => {
  const database = await getDB();
  return await database.runAsync(
    "UPDATE atividades SET nome = ? WHERE id = ?;",
    [nome, id]
  );
};

// Excluir atividade
export const deleteAtividade = async (id) => {
  const database = await getDB();
  return await database.runAsync("DELETE FROM atividades WHERE id = ?;", [id]);
};

//
// ------------------ COLETAS ------------------
//

// 🔹 Inserir coleta
export const insertColeta = async (
  nomeUsuario,
  idadeUsuario,
  nomeAtividade,
  horaInicio,
) => {
  const database = await getDB();
  const result = await database.runAsync(
    `INSERT INTO coletas 
      (nomeUsuario, idadeUsuario, nomeAtividade, horaInicio) 
     VALUES (?, ?, ?, ?);`,
    [
      nomeUsuario,
      idadeUsuario,
      nomeAtividade,
      horaInicio
    ]
  );

  if (result.changes > 0) {
    return result.lastInsertRowId; 
  } else {
    return null;
  }
};

// 🔹 Buscar todas coletas
export const getColetas = async () => {
  const database = await getDB();
  return await database.getAllAsync("SELECT * FROM coletas ORDER BY id DESC;");
};

// 🔹 Buscar uma coleta por ID
export const getColetaById = async (id) => {
  const database = await getDB();
  return await database.getFirstAsync("SELECT * FROM coletas WHERE id = ?;", [
    id,
  ]);
};

// 🔹 Atualizar coleta
export const updateColeta = async (
  id,
  nomeUsuario,
  idadeUsuario,
  nomeAtividade,
  horaInicio,
  horaFim,
  conexaoEstabelecida,
  qtdDadosRecebidos
) => {
  const database = await getDB();
  return await database.runAsync(
    `UPDATE coletas 
        SET nomeUsuario = ?, idadeUsuario = ?, nomeAtividade = ?, 
            horaInicio = ?, horaFim = ?, conexaoEstabelecida = ?, qtdDadosRecebidos = ?
      WHERE id = ?;`,
    [
      nomeUsuario,
      idadeUsuario,
      nomeAtividade,
      horaInicio,
      horaFim,
      conexaoEstabelecida,
      qtdDadosRecebidos,
      id,
    ]
  );
};

export const finalizarColeta = async (
  id,
  horaFim,
  conexaoEstabelecida,
  qtdDadosRecebidos
) => {
  const database = await getDB();
  return await database.runAsync(
    `UPDATE coletas 
        SET horaFim = ?, conexaoEstabelecida = ?, qtdDadosRecebidos = ?
      WHERE id = ?;`,
    [
      horaFim,
      conexaoEstabelecida,
      qtdDadosRecebidos,
      id
    ]
  );
};

// 🔹 Excluir coleta
export const deleteColeta = async (id) => {
  try {

    const database = await getDB();
    return await database.runAsync("DELETE FROM coletas WHERE id = ?;", [id]);
  }
  catch(err) {
    console.log(err)
  }
};