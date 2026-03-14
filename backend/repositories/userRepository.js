const db = require("../config/database");

exports.create = async (data) => {
  const result = await db.query(
    "INSERT INTO users(name,email,password) VALUES($1,$2,$3) RETURNING *",
    [data.name, data.email, data.password]
  );
  return result.rows[0];
};

exports.findAll = async () => {
  const result = await db.query("SELECT * FROM users");
  return result.rows;
};

exports.deleteById = async (id) => {
  const result = await db.query(
    "DELETE FROM users WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};