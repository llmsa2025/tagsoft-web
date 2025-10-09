import { JSONPath } from 'jsonpath-plus';
import { Condition, Trigger } from './types';

function opEval(left: any, op: Condition['op'], right: any):
