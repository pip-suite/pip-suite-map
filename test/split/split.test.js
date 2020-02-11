describe('pipSplit', function () {
    'use strict';

    describe('service', function () {
        var rootScope,
            provider,
            service;

        beforeEach(module('pipLayout.Split', function (pipSplitProvider) {
            provider = pipSplitProvider;
        }));

        beforeEach(inject(function (_$rootScope_, pipSplit) {
            rootScope = _$rootScope_;
            service = pipSplit;
        }));

        it('exception', function () {
            expect(function () {
                provider.addTransitionSequence({});
            }).to.throw(/Transition sequence must be an array of state names/);
            expect(function () {
                provider.addTransitionSequence([]);
            }).to.throw(/Transition sequence must be an array of state names/);
            expect(function () {
                provider.addTransitionSequence(['state1', 'state2']);
            }).to.not.throw(/Transition sequence must be an array of state names/);
        });

        it('forward transaction', function () {
            provider.addTransitionSequence(['state1', 'state2']);
            expect(service.forwardTransition({name: 'state2'}, {name: 'state1'})).to.be.true;
            expect(service.forwardTransition({name: 'state1'}, {name: 'state2'})).to.be.false;
        });


    });

});

