describe('pipTiles', function () {
    'use strict';

    describe('directive', function () {
        var $compile,
            $rootScope,
            scope,
            element,
            tilesContainer,
            sizer,
            template = '<pip-tiles><div class="pip-tile" ng-repeat="tile in tiles">{{ tile.name }}</div></pip-tiles>',
            tightTemplate = '<pip-tiles column-width="200"><div class="pip-tile" ng-repeat="tile in tiles">' +
                '{{ tile.name }}</div></pip-tiles>';

        function getRandomTile(number) {
            var random = Math.floor(Math.random() * 3);

            return {
                name: 'Tile #' + number,
                size: ['tile-lg', 'tile-md', 'tile-sm'][random]
            };
        }

        function getRandomTiles(number, count) {
            var result = [],
                i,
                c = count || 5;

            for (i = 0; i < c; ++i) {
                result[i] = getRandomTile(number + i);
            }

            return result;
        }

        beforeEach(function () {
            module('pipLayout.Tiles');
        });

        beforeEach(function () {
            inject(function (_$compile_, _$rootScope_) {
                $compile = _$compile_;
                $rootScope = _$rootScope_;
            });
        });

        beforeEach(function () {
            scope = $rootScope.$new();
            element = $compile(template)(scope);

            scope.tiles = getRandomTiles(1, 16);
            scope.$digest();

            tilesContainer = element.find('.pip-tiles-container');
            sizer = tilesContainer.find('.pip-tile-sizer');
        });

        it('insert template from url', function () {
            expect(tilesContainer.length).to.equal(1);
        });

        it('transclude proper count of tiles', function () {
            var transcludedElements = tilesContainer.find('.pip-tile');

            expect(transcludedElements.length).to.equal(16);
        });

        it('add class to element to container', function () {
            expect(element.hasClass('pip-tiles')).to.be.true;
        });

        it('add sizer block to container', function () {
            expect(sizer.length).to.equal(1);
        });

        it('set proper widths for small window', function () {
            expect(tilesContainer.css('width')).to.equal('369px');
            expect(sizer.css('width')).to.equal('368px');
        });

        it('change css width property on sizer and container depending on column or window width', function () {
            scope = $rootScope.$new();
            element = $compile(tightTemplate)(scope);
            scope.tiles = getRandomTiles(1, 16);
            scope.$digest();

            tilesContainer = element.find('.pip-tiles-container');
            sizer = tilesContainer.find('.pip-tile-sizer');

            expect(tilesContainer.css('width')).to.equal('369px');
            expect(sizer.css('width')).to.equal('368px');
        });

    });

});
