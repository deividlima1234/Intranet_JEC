UPDATE estudiante_avances
SET id_evaluacion = NULL
WHERE id_evaluacion IN (
    SELECT id_evaluacion FROM curso_evaluaciones 
    WHERE descripcion = 'Generado automáticamente por migración'
    AND id_evaluacion NOT IN (SELECT id_evaluacion FROM curso_notas WHERE id_evaluacion IS NOT NULL)
);

DELETE FROM evaluacion_criterios 
WHERE id_evaluacion IN (
    SELECT id_evaluacion FROM curso_evaluaciones 
    WHERE descripcion = 'Generado automáticamente por migración'
    AND id_evaluacion NOT IN (SELECT id_evaluacion FROM curso_notas WHERE id_evaluacion IS NOT NULL)
);

DELETE FROM curso_evaluaciones 
WHERE descripcion = 'Generado automáticamente por migración'
AND id_evaluacion NOT IN (SELECT id_evaluacion FROM curso_notas WHERE id_evaluacion IS NOT NULL);
