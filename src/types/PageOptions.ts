import { Renderer } from "../renderer";
import { Router } from "../router";
import { StateController } from "../state";

export type PageOptions = { router: Router, renderer: Renderer, state: StateController }
