const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

const isProd =
  process.env.NODE_ENV === 'production' ||
  process.env.NG_BUILD_ENV === 'production';

const sharedConfig = isProd
  ? {}
  : shareAll({
      singleton: true,
      strictVersion: false,
      requiredVersion: 'auto',
      pinToShared: false
    });

const sharedExplicitConfig = isProd
  ? {}
  : {
      '@angular/core': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
      '@angular/common': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
      '@angular/platform-browser': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
      '@angular/platform-browser/animations': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
      '@angular/router': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
      '@angular/forms': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
      '@angular/common/http': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
      'rxjs': { singleton: true, strictVersion: false, requiredVersion: 'auto' },
      'tslib': { singleton: true, strictVersion: false, requiredVersion: 'auto' }
    };

module.exports = withNativeFederation({

  name: 'schools',

  exposes: {
    './SchoolsModule': './src/app/schools/schools.module.ts',
    './Component': './src/app/app.ts',
  },

  shared: sharedConfig,

  // Explicitly ensure common Angular libs and rxjs are shared as singletons
  // This helps avoid duplicate Angular runtimes when a host and remote use different bundles
  sharedExplicit: sharedExplicitConfig,

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    // Add further packages you don't need at runtime
  ],

  // Please read our FAQ about sharing libs:
  // https://shorturl.at/jmzH0

  features: {
    // New feature for more performance and avoiding
    // issues with node libs. Comment this out to
    // get the traditional behavior:
    ignoreUnusedDeps: true
  }
  
});
