const db = require("../config/database");

exports.create = async (data) => {
  const result = await db.query(
    "INSERT INTO products(name,price,stock) VALUES($1,$2,$3) RETURNING *",
    [data.name, data.price, data.stock]
  );
  return result.rows[0];
};

exports.findAll = async () => {
  const result = await db.query("SELECT * FROM products");
  return result.rows;
};

exports.deleteById = async (id) => {
  const result = await db.query(
    "DELETE FROM products WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};