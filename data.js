const requiredFields = ['ORG', 'NAME', 'AGE'];

const missing = requiredFields.filter(field => !req.body[field]);

if (missing.length) {
    return res.status(400).json({
        error: `${missing.join(', ')} ${Constants.MISSING_REQUIRED_FIELDS}`,
    });
}

const { ORG, NAME, AGE } = req.body;

if (!ORG) {
    return res.status(400).json({ error: 'ORG ${Constants.MISSING_REQUIRED_FIELDS}' });
}
if (!NAME) {
    return res.status(400).json({ error: 'NAME ${Constants.MISSING_REQUIRED_FIELDS}' });
}
if (!AGE) {
    return res.status(400).json({ error: 'AGE ${Constants.MISSING_REQUIRED_FIELDS}' });
}