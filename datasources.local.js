module.exports = {
  "aws": {
    "host": "memosyne.cepasb0h4kbd.us-east-2.rds.amazonaws.com",
    "database": "postgres",
    "password": "dogs_are_very_fuzzy",
    "name": "aws",
    "user": "memosyne",
    "connector": "postgresql",
    "debug": true
  },
  "Mail": {
    "name": "Mail",
    "connector": "mail",
    "transports": [
      {
        "type": "SMTP",
        "host": "smtp.gmail.com",
        "secure": true,
        "port": 465,
        "auth": {
          "user": "mrunderhill.bree@gmail.com",
          "pass": "Cirdan999"
        }
      }
    ]
  }
};
