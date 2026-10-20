import data from "./generated-projects.json";
import { parseProjects, publishedProjects } from "../lib/projects";
export const projects = parseProjects(data);
export const publicProjects = publishedProjects(projects);
