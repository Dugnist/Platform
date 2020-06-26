import NeutralinoMethods from './methods';

const check = setInterval(() => {
  if (window.Neutralino) {
    clearInterval(check);
    window.Neutralino.init({
      load: function (d) {
        console.log('loaded', d);

        NeutralinoMethods.start();
      },
      pingSuccessCallback: function () {
        console.log('success');
      },
      pingFailCallback: function () {
        console.log('fail');
      },
    });
  }
}, 500);

export default {
  help: NeutralinoMethods.help,
};
