const authMiddleware = require('../middleware/auth');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { headers: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    test('Doit rejeter une requête sans header Authorization', () => {
        authMiddleware(req, res, next);
        
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authentification requise !' });
    });

    test('Doit appeler next() si le token est valide', () => {
        req.headers.authorization = 'Bearer faux_token_valide';
        jwt.verify.mockReturnValue({ userId: 123 });

        authMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toBeDefined();
        expect(req.user.userId).toBe(123);
    });
});