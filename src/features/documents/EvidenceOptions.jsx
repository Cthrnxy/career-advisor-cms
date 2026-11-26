import React from 'react';
import {LIST_A,LIST_B,LIST_C} from '../enrollment/formEditorRules.js';
export default function EvidenceOptions({value={},onChange}){
 return <fieldset><legend>201 evidence (optional)</legend><p>Select every document contained in this file.</p>{Object.entries({A:LIST_A,B:LIST_B,C:LIST_C}).map(([group,options])=><div key={group}><strong>List {group}</strong>{options.map(option=><label key={option} style={{display:'block',margin:'8px 0'}}><input type="checkbox" checked={(value[group]||[]).includes(option)} onChange={e=>onChange({...value,[group]:e.target.checked?[...(value[group]||[]),option]:(value[group]||[]).filter(x=>x!==option)})}/> {option}</label>)}</div>)}</fieldset>
}
