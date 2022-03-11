import macro from 'vtk.js/Sources/macro';
import * as vtkMath from 'vtk.js/Sources/Common/Core/Math';
import Constants from 'vtk.js/Sources/Rendering/Core/VolumeMapper/Constants';
import vtkAbstractMapper from 'vtk.js/Sources/Rendering/Core/AbstractMapper';

const { BlendMode } = Constants;

// ----------------------------------------------------------------------------
// vtkVolumeMapper methods
// ----------------------------------------------------------------------------

function vtkVolumeMapper(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkVolumeMapper');

  publicAPI.getBounds = () => {
    const input = publicAPI.getInputData();
    if (!input) {
      model.bounds = vtkMath.createUninitializedBounds();
    } else {
      if (!model.static) {
        publicAPI.update();
      }
      model.bounds = input.getBounds();
    }
    return model.bounds;
  };

  publicAPI.update = () => {
    publicAPI.getInputData();
  };

  publicAPI.setBlendModeToComposite = () => {
    publicAPI.setBlendMode(BlendMode.COMPOSITE_BLEND);
  };

  publicAPI.setBlendModeToMaximumIntensity = () => {
    publicAPI.setBlendMode(BlendMode.MAXIMUM_INTENSITY_BLEND);
  };

  publicAPI.setBlendModeToMinimumIntensity = () => {
    publicAPI.setBlendMode(BlendMode.MINIMUM_INTENSITY_BLEND);
  };

  publicAPI.setBlendModeToAverageIntensity = () => {
    publicAPI.setBlendMode(BlendMode.AVERAGE_INTENSITY_BLEND);
  };

  publicAPI.getBlendModeAsString = () =>
    macro.enumToString(BlendMode, model.blendMode);
}

// ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------

// TODO: what values to use for averageIPScalarRange to get GLSL to use max / min values like [-Math.inf, Math.inf]?
const DEFAULT_VALUES = {
  bounds: [1, -1, 1, -1, 1, -1],
  sampleDistance: 1.0,
  imageSampleDistance: 1.0,
  maximumSamplesPerRay: 1000,
  autoAdjustSampleDistances: true,
  blendMode: BlendMode.COMPOSITE_BLEND,
  averageIPScalarRange: [-1000000.0, 1000000.0],

  // If the camera goes inside the volume, coordinate transformation behind the camera fails, then the rendering will not be correct.
  // So if you want to skip the calculation of the viewport bounds of the volume, please set useViewportBoundsOfVolume to false.
  useViewportBoundsOfVolume: true,
};

// ----------------------------------------------------------------------------

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  vtkAbstractMapper.extend(publicAPI, model, initialValues);

  // Build VTK API
  macro.obj(publicAPI, model);
  macro.algo(publicAPI, model, 1, 0);

  macro.setGet(publicAPI, model, [
    'sampleDistance',
    'imageSampleDistance',
    'maximumSamplesPerRay',
    'autoAdjustSampleDistances',
    'blendMode',
    'useViewportBoundsOfVolume',
  ]);

  macro.setGetArray(publicAPI, model, ['averageIPScalarRange'], 2);

  macro.event(publicAPI, model, 'lightingActivated');

  // Object methods
  vtkVolumeMapper(publicAPI, model);
}

// ----------------------------------------------------------------------------

export const newInstance = macro.newInstance(extend, 'vtkVolumeMapper');

// ----------------------------------------------------------------------------

export default { newInstance, extend };
