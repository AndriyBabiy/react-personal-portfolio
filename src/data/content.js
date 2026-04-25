// Thin adapter: re-exports data from wrapped-object JSON files
// Edited via Sveltia CMS at /admin/
import profileFile from "./profile.json";
import projectsFile from "./projects.json";
import skillsFile from "./skills.json";
import siteConfigFile from "./siteConfig.json";
import desktopConfigFile from "./desktopConfig.json";
import desktopBackgroundsFile from "./desktopBackgrounds.json";

export const profile = profileFile.profile;
export const projects = projectsFile.projects;
export const skills = skillsFile.skills;
export const siteConfig = siteConfigFile.siteConfig;
export const desktopConfig = desktopConfigFile.desktopConfig;
export const desktopBackgrounds = desktopBackgroundsFile.desktopBackgrounds;
