const User = require('./../models/user');
const _ = require('lodash');
const Sequelize = require('sequelize');
const Op = Sequelize.Op

exports.findById = async function(id) {
  return await User.findById(id);
}

exports.updateSocialUser = async function(accessToken, refreshToken, profile, social) {
  var email

  if (profile.emails && _.isArray(profile.emails)) {
    email = profile.emails[0].value
  }

  //console.log(JSON.stringify(profile, null, 2));

  var user = await User.find({
    where: {
      [Op.and]: {
        email: email
      }
    }
  })

  if (!email) {
    user = await User.find({
      where: {
        [Op.and]: {
          'google.id': profile.id
        }
      }
    })
  }

  if (!user) {
    user = User.build({});
  }

  var count = await User.count();
  if (!count) {
    user.is_admin = true;
  }

  var picture
  if (_.isArray(profile.photos) && profile.photos.length > 0) {
    picture = profile.photos[0].value

    if (!user.linkedin) {
      user.picture = picture
    }
  }

  if (email) {
    user.email = email;
  }

  user.name = profile.displayName;

  if (!user.username) {
    user.username = profile.displayName;
  }

  // different values depends on login type
  if (social === 'google') {

    user.google = profile._json || {};

    if (!user.first_name) {
      user.first_name = _.get(profile, 'name.givenName');
    }
    if (!user.last_name) {
      user.last_name = _.get(profile, 'name.familyName');
    }
  } else if (social === 'facebook') {

    user.facebook = profile._json || {};
  } else if (social === 'github') {

    user.github = profile._json || {};
  } else if (social === 'linkedin') {

    if (profile._json.pictureUrl) {
      user.picture = profile._json.pictureUrl;
    }
    user.linkedin = profile._json || {};
  }

  return await user.save();
}
