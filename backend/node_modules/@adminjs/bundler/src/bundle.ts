import { promises as fs } from 'fs';
import { join , parse} from 'path';
import AdminJS, { type ComponentLoader } from 'adminjs';

process.env.ADMIN_JS_SKIP_BUNDLE = 'false';
process.env.NODE_ENV = 'production';

const ADMINJS_LOCAL_DIR_PATH = '.adminjs';
const ADMINJS_ASSETS_DIR_PATH = 'node_modules/adminjs/lib/frontend/assets/scripts';
const DESIGN_SYSTEM_DIR_PATH = 'node_modules/@adminjs/design-system';

/**
 * Options for the bundler
 *
 * @memberof module:@adminjs/bundler
 * @alias BundleConfig
 */
export type BundleConfig = {
  /**
   * File path where the bundled files should be moved into.
   *
   * The path is relative to where you run the script.
   */
  destinationDir: string;
  /**
   * Your ComponentLoader instance
   */
  componentLoader: ComponentLoader;
  /**
   * File path where AdminJS entry files are generated.
   *
   * This defaults to '.adminjs'.
   * Set this only if you know what you're doing.
   *
   * The path is relative to where you run the script.
   */
  adminJsLocalDir?: string;
  /**
   * File path where AdminJS standard bundle files are located.
   *
   * This defaults to 'node_modules/adminjs/lib/frontend/assets/scripts'.
   * Set this only if you know what you're doing.
   *
   * The path is relative to where you run the script.
   */
  adminJsAssetsDir?: string;
  /**
   * File path where AdminJS design system bundle files are located.
   *
   * This defaults to 'node_modules/@adminjs/design-system'.
   * Set this only if you know what you're doing.
   *
   * The path is relative to where you run the script.
   */
  designSystemDir?: string;
  /**
   * You can define "versioning" if you want your assets to be versioned, e. g.
   * 'app.bundle.123456.js'. Please note that this requires AdminJS version >= 5.8.0
   *
   * This will generate a JSON manifest file under specified path (relative to where you run the command).
   *
   * The generated file should be linked to `assets.coreScripts` in your
   * AdminJS options object.
   */
  versioning?: AssetsVersioning;
};

/**
 * Versioning configuration
 *
 * @memberof module:@adminjs/bundler
 * @alias AssetsVersioning
 */
export type AssetsVersioning = {
  /**
   * Path where you would like your AdminJS assets-manifest file to be saved.
   */
  manifestPath: string;
}

/**
 * AdminJS file config
 *
 * @memberof module:@adminjs/bundler
 * @alias BundleFile
 */
export type BundleFile = {
  /**
   * A file name.
   */
  name: string;
  /**
   * A source path where the original file can be found.
   */
  sourcePath: string;
  /**
   * A destination path where new bundle file is copied into.
   */
  destinationPath: string;
};

const getDestinationPath = (
  asset: string,
  timestamp?: number | null,
): string => {
  if (!timestamp) return asset;

  const { ext, name } = parse(asset);

  return `${name}.${timestamp}${ext}`;
};

const createAssetsManifest = (files: BundleFile[]): string => {
  const coreScripts = files.reduce((memo, { destinationPath, name }) => {
    memo[name] = parse(destinationPath).base;

    return memo;
  }, {});

  return JSON.stringify(coreScripts);
};

/**
 * Bundles AdminJS javascript browser files. This is an alternative to bundling those files on server startup.
 * The bundled files are stored in "destinationDir". Afterwards, you can for example:
 * 1. Upload those files to a public storage bucket and tell AdminJS to use files from there:
 * ```javascript
 *   const adminJs = new AdminJS({ assetsCDN: <your storage bucket url> })
 * ```
 * 2. Serve the "destinationDir" as a public folder, using i. e. express.static:
 * ```javascript
 *   app.use(express.static(destinationDir));
 *   ...
 *   const adminJs = new AdminJS({ assetsCDN: <your server's url> })
 * ```
 *
 * IMPORTANT: To prevent AdminJS from attempting to generate a new bundle on server startup,
 * you must set `ADMIN_JS_SKIP_BUNDLE="true"` environment variable!
 *
 *
 * @param {BundleConfig} options
 * @memberof module:@adminjs/bundler
 * @method
 * @name bundle
 * @example
 * import { bundle } from '../../src';
 *
 * (async () => {
 *   const files = await bundle({
 *     customComponentsInitializationFilePath: 'src/components/index.ts',
 *     destinationDir: 'src/public',
 *   });
 *
 *   console.log(files);
 *   // do something with built files here
 * })();
 *
 */
const bundle = async ({
  destinationDir,
  componentLoader,
  adminJsLocalDir = ADMINJS_LOCAL_DIR_PATH,
  adminJsAssetsDir = ADMINJS_ASSETS_DIR_PATH,
  designSystemDir = DESIGN_SYSTEM_DIR_PATH,
  versioning,
}: BundleConfig): Promise<BundleFile[]> => {
  const admin = new AdminJS({ componentLoader });
  await admin.initialize();

  const timestamp = versioning?.manifestPath ? Date.now() : null;
  await fs.mkdir(join(process.cwd(), destinationDir), { recursive: true });
  const files = [
    {
      name: 'components.bundle.js',
      sourcePath: join(process.cwd(), `${adminJsLocalDir}/bundle.js`),
      destinationPath: join(process.cwd(), destinationDir, getDestinationPath('components.bundle.js', timestamp))
    },
    {
      name: 'app.bundle.js',
      sourcePath: join(process.cwd(), `${adminJsAssetsDir}/app-bundle.production.js`),
      destinationPath: join(process.cwd(), destinationDir, getDestinationPath('app.bundle.js', timestamp)),
    },
    {
      name: 'global.bundle.js',
      sourcePath: join(process.cwd(), `${adminJsAssetsDir}/global-bundle.production.js`),
      destinationPath: join(process.cwd(), destinationDir, getDestinationPath('global.bundle.js', timestamp))
    },
    {
      name: 'design-system.bundle.js',
      sourcePath: join(process.cwd(), `${designSystemDir}/bundle.production.js`),
      destinationPath: join(process.cwd(), destinationDir, getDestinationPath('design-system.bundle.js', timestamp))
    },
  ];

  const [ customComponentsBundle, ...standardBundles ] = files;

  await Promise.all(standardBundles.map(({ sourcePath, destinationPath }) => fs.copyFile(
    sourcePath,
    destinationPath,
  )));

  await fs.rename(
    customComponentsBundle.sourcePath,
    customComponentsBundle.destinationPath,
  );

  if (versioning?.manifestPath) {
    const manifestContents = createAssetsManifest(files);
    const { ext } = parse(versioning?.manifestPath);

    if (ext !== '.json') {
      await Promise.all(files.map(({ destinationPath }) => fs.unlink(destinationPath)));
      throw new Error('Invalid "versioning.manifestPath". File name must have .json extension.');
    }

    await fs.writeFile(
      join(process.cwd(), versioning.manifestPath),
      manifestContents,
    );
  }

  console.log(`✨ Successfully built AdminJS bundle files! ✨`);

  return files;
};

export default bundle;
