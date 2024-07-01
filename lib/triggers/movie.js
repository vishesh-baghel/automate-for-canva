"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const perform = async (z, bundle) => {
    const response = await z.request('https://auth-json-server.zapier-staging.com/movies');
    return response.data;
};
exports.default = {
    key: 'movie',
    noun: 'Movie',
    display: {
        label: 'New Movie',
        description: 'Triggers when a new movie is created.',
    },
    operation: {
        perform,
        sample: {
            id: '1',
            title: 'example',
        },
    },
};
