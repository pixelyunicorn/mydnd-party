'use strict';

const blogposts = {
    'power-of-lead': {
        title: 'The Power of Lead',
        author: 'Nick Felker',
        published: '2018-08-01T12:00:00-07:00',
        updated: '2018-08-01T12:00:00-07:00',
        summary: `On the periodic table, lead is among the most dense metals. Lead as a material        has been around in our society for millenia. Since the beginning of civilization,
        it has been used for cosmetics, fishing, and currency. Plumbing derives from the use of
        lead for the pipes based on the Latin name for lead, plumbum.`,
        filepath: 'blog/power-of-lead.html',
        tags: ['items']
    }
};

const blogtags = {
    'items': [
        'power-of-lead',
    ]
}

module.exports = {
    blogposts,
    blogtags
};