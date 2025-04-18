const Detector = require('technology-detector-node');

async function main(domain) {
    const detector = new Detector();

    try {
        await detector.init();
        const site = await detector.open("https://" + domain);
        const results = await site.analyze();

        console.log(results?.technologies);
    } catch (error) {
	    console.log(error);
      return {
        tech: []
      };
    } finally {
      await detector.destroy();
    }
}

main("snapsec.co")
