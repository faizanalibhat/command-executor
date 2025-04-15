const Detector = require('technology-detector-node');

async function main(domain) {
    const detector = new Detector();

    try {
        await detector.init();
        const site = await detector.open("https://" + domain);
        const results = await site.analyze();

        return {
          tech: results?.technologies,
        }
    } catch (error) {
	    console.log(error);
      return {
        tech: []
      };
    } finally {
      const fs = require('fs');

      try {
        fs.unlinkSync('/tmp/chrome-user-data/SingletonLock');
        fs.unlinkSync('/app/tmp/chromium/SingletonLock');
      }
      catch(err) {}

      await detector.destroy();
    }
}

module.exports = main;
