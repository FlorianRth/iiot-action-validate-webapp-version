const core = require("@actions/core");
const github = require("@actions/github");

const stripVersion = (version) => {
  // major.minor.patch
  // major.minor.patch-preview.1
  const parts = version.split("-");

  const numbers = parts[0].split(".");
  const major = numbers[0];
  const minor = numbers[1];
  const patch = numbers[2];

  if (parts.length === 2 && parts[1].startsWith("preview")) {
    const isPreview = true;
    const previewVersion = parts[1].split(".")[1];
    return { major, minor, patch, isPreview, previewVersion };
  }

  return {
    major,
    minor,
    patch,
    isPreview: false,
    previewVersion: null,
  };
};

const validateVersion = (strippedVersion, prBase) => {
  if (prBase === "main" || prBase === "master") {
    if (strippedVersion.isPreview) {
      core.setFailed("Cannot merge preview version into main / master");
    }
  }
  if (prBase === "develop") {
    if (!strippedVersion.isPreview) {
      core.setFailed("Cannot merge non-preview version into develop");
    }
  }
};

try {
  const prBase = core.getInput("pr-base");
  const version = core.getInput("version");

  console.log(
    "Base from Github object: ",
    github.context.payload.sender.prBase
  );

  const strippedVersion = stripVersion(version);

  validateVersion(strippedVersion, prBase);

  console.log("Major: ", strippedVersion.major);
  console.log("Minor: ", strippedVersion.minor);
  console.log("Patch: ", strippedVersion.patch);
  console.log("isPreview: ", strippedVersion.isPreview);
  console.log("previewVersion: ", strippedVersion.previewVersion);

  console.log("PR-Into: ", prBase);
} catch (error) {
  core.setFailed(error.message);
}
