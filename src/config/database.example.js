module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  port: 5431,
  username: 'postgres',
  password: 'docker',
  database: 'meetapp',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
