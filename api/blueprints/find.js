/*var Promise = require('bluebird');
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');*/

/**
 * Find Records
 * GET /:model
 *
 * An API call to find and return model instances from the data adapter using the specified criteria.
 * If an id was specified, just the instance with that unique id will be returned.
 */
/*module.exports = function (req, res) {
  var Model = actionUtil.parseModel(req);
  var where = actionUtil.parseCriteria(req);
  var limit = actionUtil.parseLimit(req);
  var skip = actionUtil.parseSkip(req);
  var sort = actionUtil.parseSort(req);
  var findQuery = actionUtil.populateEach(Model.find().where(where).limit(limit).skip(skip).sort(sort), req);
  var countQuery = Model.count(where);

  Promise.all([findQuery, countQuery])
    .spread(function (records, count) {
      return [records, null, null, {
        criteria: where,
        limit: limit,
        start: skip,
        end: skip + limit,
        total: count
      }];
    })
    .spread(res.ok)
    .catch(res.serverError);
};
*/
var Promise = require('bluebird');
var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil'),
  _ = require('lodash');
module.exports = function findRecords (req, res) {

  // Look up the model
  var Model = actionUtil.parseModel(req);


  // If an `id` param was specified, use the findOne blueprint action
  // to grab the particular instance with its primary key === the value
  // of the `id` param.   (mainly here for compatibility for 0.9, where
  // there was no separate `findOne` action)
  if ( actionUtil.parsePk(req) ) {
    return require('./findOne')(req,res);
  }

  // Lookup for records that match the specified criteria


  var query = Model.find()
  .where( actionUtil.parseCriteria(req) )
  .limit( actionUtil.parseLimit(req) )
  .skip( actionUtil.parseSkip(req) )
  .sort( actionUtil.parseSort(req) );
  query = actionUtil.populateRequest(query, req);
  query.exec(function found(err, matchingRecords) {
    if (err) return res.serverError(err);

    // Only `.watch()` for new instances of the model if
    // `autoWatch` is enabled.
    if (req._sails.hooks.pubsub && req.isSocket) {
      Model.subscribe(req, matchingRecords);
      if (req.options.autoWatch) { Model.watch(req); }
      // Also subscribe to instances of all associated models
      _.each(matchingRecords, function (record) {
        actionUtil.subscribeDeep(req, record);
      });
    }

    Model.count(actionUtil.parseCriteria(req)).exec(function(error, total) {
      if (err) return res.serverError(err);
      var data = {};

      data.total = total;
      data.results = matchingRecords;
      res.ok(data);
    });



  });
};