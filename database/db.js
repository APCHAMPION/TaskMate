import * as SQLite from 'expo-sqlite/legacy';

const db = SQLite.openDatabase('tododb.db');

export const createTables = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS groups (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, status TEXT, groupId INTEGER, FOREIGN KEY (groupId) REFERENCES groups(id));`
    );
  });
};

export const dbTransaction = (sql, params = [], success, error) => {
  db.transaction(tx => {
    tx.executeSql(
      sql,
      params,
      (_, result) => success(result),
      (_, err) => error(err)
    );
  });
};

export default db;
