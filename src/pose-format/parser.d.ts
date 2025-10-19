
import { PoseModel, PoseHeaderModel, PoseBodyModel } from "../renderers/types";

export function parsePose(buffer: Buffer): PoseModel;

export function getHeaderParser(): any;

export function getBodyParserV0_0(header: PoseHeaderModel): any;

export function parseBodyV0_0(header: PoseHeaderModel, buffer: Buffer): PoseBodyModel;

export function parseBodyV0_1(header: PoseHeaderModel, buffer: Buffer, version: number): PoseBodyModel;
