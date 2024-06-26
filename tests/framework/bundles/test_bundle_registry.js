describe('pc.BundleRegistry', function () {
    beforeEach(function () {
        this.loader = sinon.fake();
        this.assets = new pc.AssetRegistry(this.loader);
        this.bundles = new pc.BundleRegistry(this.assets);
    });

    afterEach(function () {
        var assets = this.assets.list();
        for (var i = 0; i < assets.length; i++) {
            assets[i].unload();
            assets[i].off();
        }
        this.assets.off();
        this.assets = null;

        this.bundles.destroy();
        this.bundles = null;
    });

    it('bundle asset is added to the bundle registry', function () {
        var asset = new pc.Asset('bundle', 'bundle', null, { assets: [] });
        this.assets.add(asset);
        var assets = this.bundles.list();
        expect(assets).to.deep.equal([asset]);
    });

    it('bundle asset is removed from the bundle registry', function () {
        var asset = new pc.Asset('bundle', 'bundle', null, { assets: [] });
        this.assets.add(asset);
        var bundles = this.bundles.list();
        expect(bundles).to.deep.equal([asset]);

        this.assets.remove(asset);
        bundles = this.bundles.list();
        expect(bundles).to.deep.equal([]);
    });

    it('listBundlesForAsset() returns null for assets not in bundles', function () {
        var asset = new pc.Asset('asset', 'text', {
            url: 'text.txt'
        });
        this.assets.add(asset);

        var notInBundle = new pc.Asset('asset', 'text', {
            url: 'text2.txt'
        });
        this.assets.add(notInBundle);

        var bundleAsset = new pc.Asset('bundle', 'bundle', null, {
            assets: [asset.id]
        });
        this.assets.add(bundleAsset);

        var bundles = this.bundles.listBundlesForAsset(notInBundle);
        expect(bundles).to.equal(null);
    });

    it('listBundlesForAsset() lists bundles for asset if asset added before bundle', function () {
        var asset = new pc.Asset('asset', 'text', {
            url: 'text.txt'
        });
        this.assets.add(asset);

        var bundleAsset = new pc.Asset('bundle', 'bundle', null, {
            assets: [asset.id]
        });
        this.assets.add(bundleAsset);

        var bundles = this.bundles.listBundlesForAsset(asset);
        expect(bundles).to.deep.equal([bundleAsset]);
    });

    it('listBundlesForAsset() lists bundles for asset if asset added after bundle', function () {
        var asset = new pc.Asset('asset', 'text', {
            url: 'text.txt'
        });

        var bundleAsset = new pc.Asset('bundle', 'bundle', null, {
            assets: [asset.id]
        });

        this.assets.add(bundleAsset);
        this.assets.add(asset);

        var bundles = this.bundles.listBundlesForAsset(asset);
        expect(bundles).to.deep.equal([bundleAsset]);
    });

    it('listBundlesForAsset() does not return removed bundle asset', function () {
        var asset = new pc.Asset('asset', 'text', {
            url: 'text.txt'
        });
        this.assets.add(asset);

        var bundleAsset = new pc.Asset('bundle', 'bundle', null, {
            assets: [asset.id]
        });
        this.assets.add(bundleAsset);

        this.assets.remove(bundleAsset);

        var bundles = this.bundles.listBundlesForAsset(asset);
        expect(bundles).to.equal(null);
    });

    it('listBundlesForAsset() does not return bundle for removed asset', function () {
        var asset = new pc.Asset('asset', 'text', {
            url: 'text.txt'
        });
        this.assets.add(asset);

        var bundleAsset = new pc.Asset('bundle', 'bundle', null, {
            assets: [asset.id]
        });
        this.assets.add(bundleAsset);

        this.assets.remove(asset);

        var bundles = this.bundles.listBundlesForAsset(asset);
        expect(bundles).to.equal(null);
    });

    it('hasUrl() returns true for url in bundle', function () {
        var asset = new pc.Asset('asset', 'text', {
            url: 'text.txt'
        });
        this.assets.add(asset);

        var bundleAsset = new pc.Asset('bundle', 'bundle', null, {
            assets: [asset.id]
        });
        this.assets.add(bundleAsset);

        expect(this.bundles.hasUrl('text.txt')).to.equal(true);
    });

    it('hasUrl() returns false for url not in bundle', function () {
        expect(this.bundles.hasUrl('missing.txt')).to.equal(false);
    });

    it('hasUrl() returns true for url with query parameters in bundle', function () {
        var asset = new pc.Asset('asset', 'text', {
            url: 'text.txt?query=true&query2=true'
        });
        this.assets.add(asset);

        var bundleAsset = new pc.Asset('bundle', 'bundle', null, {
            assets: [asset.id]
        });
        this.assets.add(bundleAsset);

        expect(this.bundles.hasUrl('text.txt')).to.equal(true);
    });

    it('hasUrl() returns true for all font asset urls', function () {
        var asset = new pc.Asset('asset', 'font', {
            url: 'test.png'
        }, {
            info: {
                maps: [{
                    width: 128, height: 128
                }, {
                    width: 128, height: 128
                }]
            }
        });
        this.assets.add(asset);

        var bundleAsset = new pc.Asset('bundle', 'bundle', null, {
            assets: [asset.id]
        });
        this.assets.add(bundleAsset);

        expect(this.bundles.hasUrl('test.png')).to.equal(true);
        expect(this.bundles.hasUrl('test1.png')).to.equal(true);
    });

    it('hasUrl() returns false after asset is removed', function () {
        var asset = new pc.Asset('asset', 'text', {
            url: 'text.txt'
        });
        this.assets.add(asset);

        var bundleAsset = new pc.Asset('bundle', 'bundle', null, {
            assets: [asset.id]
        });
        this.assets.add(bundleAsset);

        this.assets.remove(asset);

        expect(this.bundles.hasUrl('text.txt')).to.equal(false);
    });

    it('urlIsLoadedOrLoading() returns false if bundle not loaded', function () {
        var asset = new pc.Asset('asset', 'text', {
            url: 'text.txt'
        });
        this.assets.add(asset);

        var bundleAsset = new pc.Asset('bundle', 'bundle', null, {
            assets: [asset.id]
        });
        this.assets.add(bundleAsset);

        expect(this.bundles.urlIsLoadedOrLoading('text.txt')).to.equal(false);
    });

    it('urlIsLoadedOrLoading() returns false if bundle loaded without a resource', function () {
        var asset = new pc.Asset('asset', 'text', {
            url: 'text.txt'
        });
        this.assets.add(asset);

        var bundleAsset = new pc.Asset('bundle', 'bundle', null, {
            assets: [asset.id]
        });
        this.assets.add(bundleAsset);
        bundleAsset.loaded = true;

        expect(this.bundles.urlIsLoadedOrLoading('text.txt')).to.equal(false);
    });

    it('urlIsLoadedOrLoading() returns true if bundle loaded', function () {
        var asset = new pc.Asset('asset', 'text', {
            url: 'text.txt'
        });
        this.assets.add(asset);

        var bundleAsset = new pc.Asset('bundle', 'bundle', null, {
            assets: [asset.id]
        });
        this.assets.add(bundleAsset);

        bundleAsset.loaded = true;
        bundleAsset.resource = sinon.fake();

        expect(this.bundles.urlIsLoadedOrLoading('text.txt')).to.equal(true);
    });

    it('urlIsLoadedOrLoading() returns true if bundle being loaded', function () {
        var asset = new pc.Asset('asset', 'text', {
            url: 'text.txt'
        });
        this.assets.add(asset);

        var bundleAsset = new pc.Asset('bundle', 'bundle', null, {
            assets: [asset.id]
        });
        this.assets.add(bundleAsset);
        bundleAsset.loading = true;

        expect(this.bundles.urlIsLoadedOrLoading('text.txt')).to.equal(true);
    });

    it('loadUrl() calls callback with error if bundle fails to load', function (done) {
        var asset = new pc.Asset('asset', 'text', {
            url: 'text.txt'
        });
        this.assets.add(asset);

        var bundleAsset = new pc.Asset('bundle', 'bundle', null, {
            assets: [asset.id]
        });
        this.assets.add(bundleAsset);
        bundleAsset.loading = true;

        this.bundles.loadUrl('text.txt', function (err, blobUrl) {
            expect(err).to.equal('error');
            done();
        });

        setTimeout(function () {
            bundleAsset.loading = false;
            bundleAsset.loaded = true;
            this.assets.fire('error:' + bundleAsset.id, 'error');
        }.bind(this));
    });
});
