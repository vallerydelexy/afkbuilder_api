'use strict';

/**
 *  comp controller ./src/api/comp/controllers/comp.js
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { sanitize } = require("@strapi/utils");
const logger = require('../../../utilities/logger');

function selectProps(...props) {
  return function(obj){
    const newObj = {};
    props.forEach(name => {
      newObj[name] = obj[name];
    });
    return newObj;
  }
}

module.exports = createCoreController('api::comp.comp', ({ strapi }) => ({
  async create(ctx) {
    // required for sanitize step
    const { auth } = ctx.state;

    // sanitize input data
    const compContentType = strapi.contentTypes['api::comp.comp'];
    const compSanitizedInputData = await sanitize.contentAPI.input(
      ctx.request.body.data,
      compContentType,
      { auth }
    );

    // add author field
    const user = ctx.state.user;
    const author = user.id;
    compSanitizedInputData.author = author;

    // parse tags field
    let tagList = [];
    const inputTags = ctx.request.body.data.tags.map(e => e.trim());
    const uniqueTags = [...new Set(inputTags)];
    for(let tag of uniqueTags) {
      if(tag) {
        let [existingTag] = await strapi.entityService.findMany('api::tag.tag', {
          fields: ['id'],
          filters: {
            name: tag,
          },
        });
        if (!existingTag) {
          // tag does not exist yet, add a new tag
          try {
            const contentType = strapi.contentTypes['api::tag.tag'];
            const sanitizedInputData = await sanitize.contentAPI.input(
              { name: tag },
              contentType,
              { auth }
            );
            const newTag = await strapi.entityService.create('api::tag.tag', {
              data: sanitizedInputData,
            });
            tagList.push(newTag.id);
          } catch(err) {
            logger.error(`An error occurred on REST comp create while adding a new tag: ${JSON.stringify(err)}`);
            return ctx.throw(500, `An error occurred on REST comp create while adding a new tag.`);
          }
        } else {
          // tag already exists, add its ID to the tagList
          tagList.push(existingTag.id);
        }
      }
    }
    compSanitizedInputData.tags = tagList;

    // parse heroes field
    let heroList = [];
    const inputHeroes = ctx.request.body.data.heroes.map(e => e.trim());
    const uniqueHeroes = [...new Set(inputHeroes)];
    for(let hero of uniqueHeroes) {
      if(hero) {
        let [existingHero] = await strapi.entityService.findMany('api::hero.hero', {
          fields: ['id'],
          filters: {
            name: hero,
          },
        });
        if (!existingHero) {
          // hero does not exist yet, add a new hero
          try {
            const contentType = strapi.contentTypes['api::hero.hero'];
            const sanitizedInputData = await sanitize.contentAPI.input(
              { name: hero },
              contentType,
              { auth }
            );
            const newHero = await strapi.entityService.create('api::hero.hero', {
              data: sanitizedInputData,
            });
            heroList.push(newHero.id);
          } catch(err) {
            logger.error(`An error occurred on REST comp create while adding a new hero: ${JSON.stringify(err)}`);
            return ctx.throw(500, `An error occurred on REST comp create while adding a new hero`);
          }
        } else {
          // hero already exists, add its ID to the heroList
          heroList.push(existingHero.id);
        }
      }
    }
    compSanitizedInputData.heroes = heroList;

    // try to create the comp
    try {
      const entity = await strapi.entityService.create('api::comp.comp', {data: compSanitizedInputData});
      logger.debug(`REST Comp create called with args: ${JSON.stringify(ctx.request.body)}`);
      return entity;
    } catch(err) {
      logger.error(`An error occurred on REST Comp create: ${JSON.stringify(err)}`);
      return ctx.throw(500);
    }
  },
  async update(ctx) {
    // check that the user is authorized to update the comp
    try {
      const [comp] = await strapi.entityService.findMany('api::comp.comp', {
        fields: ['name'],
        filters: {
          id: ctx.params.id,
          author: ctx.state.user.id,
        },
      });

      if (!comp) {
        const sanitized_ctx = {method: ctx.request.method, url: ctx.request.url, body: ctx.request.body};
        logger.error(`A forbidden error occurred on REST Comp update: ${JSON.stringify(sanitized_ctx)}`);
        return ctx.throw(403, `You are not authorized to update this entry.`);
      }
    } catch(err) {
      logger.error(`An error occured on REST Comp update while finding comp: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occured on REST Comp update while finding comp.`);
    }

    // required for sanitize step
    const { auth } = ctx.state;

    // parse tags field if necessary
    if(ctx.request.body.data.tags) {
      let tagList = [];
      const inputTags = ctx.request.body.data.tags.map(e => e.trim());
      const uniqueTags = [...new Set(inputTags)];
      for(let tag of uniqueTags) {
        if(tag) {
          let [existingTag] = await strapi.entityService.findMany('api::tag.tag', {
            fields: ['id'],
            filters: {
              name: tag,
            },
          });
          if (!existingTag) {
            // tag does not exist yet, add a new tag
            try {
              const contentType = strapi.contentTypes['api::tag.tag'];
              const sanitizedInputData = await sanitize.contentAPI.input(
                { name: tag },
                contentType,
                { auth }
              );
              const newTag = await strapi.entityService.create('api::tag.tag', {
                data: sanitizedInputData,
              });
              tagList.push(newTag.id);
            } catch(err) {
              logger.error(`An error occurred on REST comp update while adding a new tag: ${JSON.stringify(err)}`);
              return ctx.throw(500, `An error occurred on REST comp update while adding a new tag.`);
            }
          } else {
            // tag already exists, add its ID to the tagList
            tagList.push(existingTag.id);
          }
        }
      }
      ctx.request.body.data.tags = tagList;
    }

    // parse heroes field if necessary
    if(ctx.request.body.data.heroes) {
      let heroList = [];
      const inputHeroes = ctx.request.body.data.heroes.map(e => e.trim());
      const uniqueHeroes = [...new Set(inputHeroes)];
      for(let hero of uniqueHeroes) {
        if(hero) {
          let [existingHero] = await strapi.entityService.findMany('api::hero.hero', {
            fields: ['id'],
            filters: {
              name: hero,
            },
          });
          if (!existingHero) {
            // hero does not exist yet, add a new hero
            try {
              const contentType = strapi.contentTypes['api::hero.hero'];
              const sanitizedInputData = await sanitize.contentAPI.input(
                { name: hero },
                contentType,
                { auth }
              );
              const newHero = await strapi.entityService.create('api::hero.hero', {
                data: sanitizedInputData,
              });
              heroList.push(newHero.id);
            } catch(err) {
              logger.error(`An error occurred on REST comp update while adding a new hero: ${JSON.stringify(err)}`);
              return ctx.throw(500, `An error occurred on REST comp update while adding a new hero.`);
            }
          } else {
            // hero already exists, add its ID to the heroList
            heroList.push(existingHero.id);
          }
        }
      }
      ctx.request.body.data.heroes = heroList;
    }

    // try to update the comp
    try {
      const response = await super.update(ctx);
      const sanitized_ctx = {method: ctx.request.method, url: ctx.request.url, body: ctx.request.body};
      logger.debug(`REST Comp update called with args: ${JSON.stringify(sanitized_ctx)}`);
      return response;
    } catch(err) {
      logger.error(`An error occured on REST Comp update: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occured on REST Comp update.`);
    }
  },
  async delete(ctx) {
    // check that the user is authorized to delete the comp
    try {
      const [comp] = await strapi.entityService.findMany('api::comp.comp', {
        fields: ['name'],
        filters: {
          id: ctx.params.id,
          author: ctx.state.user.id,
        },
      });

      if (!comp) {
        const sanitized_ctx = {method: ctx.request.method, url: ctx.request.url, body: ctx.request.body};
        logger.error(`A forbidden error occurred on REST Comp delete: ${JSON.stringify(sanitized_ctx)}`);
        return ctx.throw(403, `You are not authorized to delete this entry.`);
      }
    } catch(err) {
      logger.error(`An error occured on REST Comp delete while finding comp: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occured on REST Comp delete while finding comp.`);
    }

    try {
      const response = await super.delete(ctx);
      const sanitized_ctx = {method: ctx.request.method, url: ctx.request.url, body: ctx.request.body};
      logger.debug(`REST Comp delete called with args: ${JSON.stringify(sanitized_ctx)}`);
      return response;
    } catch(err) {
      logger.error(`An error occured on REST Comp delete: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occured on REST Comp delete.`);
    }
  },
  async getAuthoredComps(ctx) {
    try {
      const comps = await strapi.entityService.findMany('api::comp.comp', {
        fields: ['uuid', 'updatedAt'],
        filters: { author: { id: ctx.state.user.id } },
      });
      return { data: {comps: comps} };
    } catch (err) {
      logger.error(`An error occurred looking up comps for getAuthoredComps: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred looking up comps for getAuthoredComps.`);
    }
  },
  async hasUpvoted(ctx) {
    try {
      const comp = await strapi.entityService.findOne('api::comp.comp', ctx.params.id, {
        populate: 'upvoters',
      });
      const result = comp.upvoters.some(e => e.id === ctx.state.user.id);
      return { data: {upvoted: result} };
    } catch (err) {
      logger.error(`An error occurred looking up comp for hasUpvoted: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred looking up comp for hasUpvoted.`);
    }
  },
  async getAllUpvoted(ctx) {
    try {
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', ctx.state.user.id, {
        populate: 'upvoted_comps',
      });
      const result = user.upvoted_comps.map(selectProps('id', 'uuid'));
      return { data: { comps: result} };
    } catch (err) {
      logger.error(`An error occurred looking up user for getAllUpvoted: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred looking up user for getAllUpvoted.`);
    }
  },
  async getUpvotes(ctx) {
    try {
      const comp = await strapi.entityService.findOne('api::comp.comp', ctx.params.id, {
        populate: 'upvoters',
      });
      return { data: {upvotes: comp.upvoters.length} };
    } catch (err) {
      logger.error(`An error occurred looking up comp for getUpvotes: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred looking up comp for getUpvotes.`);
    }
  },
  async toggleUpvote(ctx) {
    let comp;
    let hasUpvoted;
    try {
      comp = await strapi.entityService.findOne('api::comp.comp', ctx.params.id, {
        populate: 'upvoters',
      });
      hasUpvoted = comp.upvoters.some(e => e.id === ctx.state.user.id);
    } catch (err) {
      logger.error(`An error occurred on toggleUpvote while looking up comp.: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred on toggleUpvote while looking up comp.`);
    }
    try {
      if(hasUpvoted) {
        // user already upvoted, assume remove upvote
        const new_upvoters = comp.upvoters.filter(e => e.id !== ctx.state.user.id);
        await strapi.entityService.update('api::comp.comp', ctx.params.id, {
          data: {
            upvoters: new_upvoters,
          },
        });
      } else {
        // user has not upvoted, assume add upvote
        const new_upvoters = comp.upvoters.concat(ctx.state.user);
        await strapi.entityService.update('api::comp.comp', ctx.params.id, {
          data: {
            upvoters: new_upvoters,
          },
        });
      }
      // return the list of comps that the user upvoted
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', ctx.state.user.id, {
        populate: 'upvoted_comps',
      });
      const result = user.upvoted_comps.map(selectProps('id', 'uuid'));
      return { data: {comps: result} };
    } catch(err) {
      logger.error(`An error occurred updating comp for toggleUpvote: ${JSON.stringify(err)}`);
      return ctx.throw(500, `An error occurred updating comp for toggleUpvote.`);
    }
  },
}));
