// Persists express-session sessions in MongoDB (via the existing mongoose
// connection) so logins survive server restarts and redeploys.
const session = require('express-session');
const mongoose = require('mongoose');

const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 7;

const sessionSchema = new mongoose.Schema(
  {
    _id: String,
    data: { type: String, required: true },
    expires: { type: Date, required: true },
  },
  { versionKey: false }
);
// MongoDB deletes expired sessions automatically.
sessionSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

const SessionModel = mongoose.models.Session || mongoose.model('Session', sessionSchema);

class MongoSessionStore extends session.Store {
  constructor(model = SessionModel) {
    super();
    this.model = model;
  }

  _expiry(sess) {
    return sess && sess.cookie && sess.cookie.expires
      ? new Date(sess.cookie.expires)
      : new Date(Date.now() + DEFAULT_TTL_MS);
  }

  get(sid, cb) {
    this.model
      .findById(sid)
      .lean()
      .then((doc) => {
        if (!doc || doc.expires <= new Date()) return cb(null, null);
        cb(null, JSON.parse(doc.data));
      })
      .catch(cb);
  }

  set(sid, sess, cb = () => {}) {
    this.model
      .updateOne({ _id: sid }, { $set: { data: JSON.stringify(sess), expires: this._expiry(sess) } }, { upsert: true })
      .then(() => cb(null))
      .catch(cb);
  }

  touch(sid, sess, cb = () => {}) {
    this.model
      .updateOne({ _id: sid }, { $set: { expires: this._expiry(sess) } })
      .then(() => cb(null))
      .catch(cb);
  }

  destroy(sid, cb = () => {}) {
    this.model
      .deleteOne({ _id: sid })
      .then(() => cb(null))
      .catch(cb);
  }
}

module.exports = MongoSessionStore;
