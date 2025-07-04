<<<<<<< HEAD
class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = True

class LocalDevelopmentConfig(Config):

    SQLALCHEMY_DATABASE_URI = 'sqlite:///db.sqlite3'
    DEBUG = True

    SECRET_KEY = 'this-is-my-secret-key'
    SECURITY_PASSWORD_HASH = 'bcrypt'
    SECURITY_PASSWORD_SALT = 'this-is-my-salt'
    WTF_CSRF_ENABLED = False
=======
class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = True

class LocalDevelopmentConfig(Config):

    SQLALCHEMY_DATABASE_URI = 'sqlite:///db.sqlite3'
    DEBUG = True

    SECRET_KEY = 'this-is-my-secret-key'
    SECURITY_PASSWORD_HASH = 'bcrypt'
    SECURITY_PASSWORD_SALT = 'this-is-my-salt'
    WTF_CSRF_ENABLED = False
>>>>>>> cac058d (export backend done)
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'