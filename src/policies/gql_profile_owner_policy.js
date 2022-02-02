const { PolicyError } = require('@strapi/utils').errors;

// only the owner of a profile can update their profile
module.exports = async (ctx, config, { strapi }) => {
  if(parseInt(ctx.state.user.id) !== parseInt(ctx.args.id)) {
    throw new PolicyError(`You are not allowed to update this profile`, {policy: 'gql_profile_owner_policy'});
  }
  return true;
}
