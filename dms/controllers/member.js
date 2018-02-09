const utils = require('../utils');

module.exports = (app, client) => {
    app.get('/memberstatuses', (req, res) => {
        utils.getAllMembers(client, (members, err) => {
            if (err) {
                return res.status(500).send(err);
            }

            return res.status(200).json(members);
        });
    });
};
