import path from "path";

export default {
  type: "sqlite",
  database: "database.db",
  synchronize: true,
  entities: [path.join(__dirname, "entity", "*.js"), path.join(__dirname, "src", "entity", "*.ts")],
};
