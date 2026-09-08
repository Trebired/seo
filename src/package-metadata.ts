import {
  packageSlug,
  readOrganizationIdentity,
  readPackageJsonUrl,
  toTrimmedString,
} from "@trebired/utils";

const packageJson = readPackageJsonUrl(new URL("../package.json", import.meta.url));
const organization = readOrganizationIdentity({ packageJson });

const PACKAGE_ORGANIZATION_NAME = organization.name;
const PACKAGE_NAME = toTrimmedString(packageJson?.name) || `@${PACKAGE_ORGANIZATION_NAME}/seo`;
const PACKAGE_VERSION = toTrimmedString(packageJson?.version, "0.1.0");
const PACKAGE_SLUG = packageSlug(PACKAGE_NAME) || "seo";

export { PACKAGE_NAME, PACKAGE_SLUG, PACKAGE_VERSION };
