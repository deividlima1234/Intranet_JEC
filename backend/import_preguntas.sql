-- Seeding predeterminadas para juegos interactivos JEC (1ro a 5to grado)

-- ==========================================
-- ÁREA: MATEMÁTICA (10 preguntas)
-- ==========================================
INSERT INTO juego_preguntas (id_pregunta, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, area, grado, dificultad, id_cuestionario) 
VALUES 
('10000000-0000-0000-0000-000000000001', '¿Cuál es el valor de x en la ecuación: 2x + 5 = 15?', '3', '5', '10', '15', 'B', 'MATEMÁTICA', 1, 'FACIL', NULL),
('10000000-0000-0000-0000-000000000002', '¿Cuál es el área de un triángulo cuya base mide 10 cm y su altura mide 6 cm?', '16 cm²', '30 cm²', '60 cm²', '100 cm²', 'B', 'MATEMÁTICA', 1, 'FACIL', NULL),
('10000000-0000-0000-0000-000000000003', 'Si un polo cuesta S/. 30 y tiene un descuento del 20%, ¿cuánto se paga finalmente?', 'S/. 6', 'S/. 20', 'S/. 24', 'S/. 28', 'C', 'MATEMÁTICA', 2, 'MEDIO', NULL),
('10000000-0000-0000-0000-000000000004', 'Resuelve la inecuación: 3x - 4 > 8. ¿Cuál es el conjunto solución?', 'x > 4', 'x > 2', 'x < 4', 'x = 4', 'A', 'MATEMÁTICA', 2, 'MEDIO', NULL),
('10000000-0000-0000-0000-000000000005', '¿Cuál es el resultado de factorizar: x² - 9?', '(x-3)(x-3)', '(x-3)(x+3)', '(x+9)(x-9)', '(x+3)(x+3)', 'B', 'MATEMÁTICA', 3, 'MEDIO', NULL),
('10000000-0000-0000-0000-000000000006', 'En un triángulo rectángulo, si los catetos miden 3 cm y 4 cm, ¿cuánto mide la hipotenusa?', '5 cm', '7 cm', '12 cm', '25 cm', 'A', 'MATEMÁTICA', 3, 'FACIL', NULL),
('10000000-0000-0000-0000-000000000007', '¿Cuál es la probabilidad de obtener un número par al lanzar un dado común de 6 caras?', '1/6', '1/3', '1/2', '2/3', 'C', 'MATEMÁTICA', 4, 'FACIL', NULL),
('10000000-0000-0000-0000-000000000008', 'Calcula el término número 10 de la progresión aritmética: 3, 7, 11, 15...', '33', '37', '39', '43', 'C', 'MATEMÁTICA', 4, 'MEDIO', NULL),
('10000000-0000-0000-0000-000000000009', '¿Cuál es la derivada de la función f(x) = x² respecto a x?', 'x', '2x', '2', 'x²', 'B', 'MATEMÁTICA', 5, 'DIFICIL', NULL),
('10000000-0000-0000-0000-000000000010', 'Encuentra las raíces de la ecuación cuadrática: x² - 5x + 6 = 0.', 'x = 1, x = 6', 'x = -2, x = -3', 'x = 2, x = 3', 'x = 5, x = 6', 'C', 'MATEMÁTICA', 5, 'DIFICIL', NULL);

-- ==========================================
-- ÁREA: COMUNICACIÓN (10 preguntas)
-- ==========================================
INSERT INTO juego_preguntas (id_pregunta, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, area, grado, dificultad, id_cuestionario) 
VALUES 
('20000000-0000-0000-0000-000000000001', '¿Cuál de las siguientes palabras es esdrújula?', 'Cantar', 'Árbol', 'Música', 'Corazón', 'C', 'COMUNICACIÓN', 1, 'FACIL', NULL),
('20000000-0000-0000-0000-000000000002', 'Identifica el sujeto en la oración: "Los estudiantes de Huanoquite ganaron el concurso escolar".', 'El concurso escolar', 'Los estudiantes de Huanoquite', 'Ganaron el concurso', 'Huanoquite', 'B', 'COMUNICACIÓN', 1, 'FACIL', NULL),
('20000000-0000-0000-0000-000000000003', '¿Qué figura literaria consiste en exagerar la realidad en un texto?', 'Metáfora', 'Hipérbole', 'Personificación', 'Símil', 'B', 'COMUNICACIÓN', 2, 'MEDIO', NULL),
('20000000-0000-0000-0000-000000000004', '¿Cuál es el sinónimo de la palabra "EFÍMERO"?', 'Eterno', 'Pasajero', 'Fuerte', 'Brillante', 'B', 'COMUNICACIÓN', 2, 'MEDIO', NULL),
('20000000-0000-0000-0000-000000000005', '¿Quién es el autor de la célebre novela peruana "El mundo es ancho y ajeno"?', 'César Vallejo', 'Mario Vargas Llosa', 'Ciro Alegría', 'José María Arguedas', 'C', 'COMUNICACIÓN', 3, 'MEDIO', NULL),
('20000000-0000-0000-0000-000000000006', '¿A qué género literario pertenecen las obras teatrales como Romeo y Julieta?', 'Narrativo', 'Lírico', 'Dramático', 'Didáctico', 'C', 'COMUNICACIÓN', 3, 'FACIL', NULL),
('20000000-0000-0000-0000-000000000007', '¿Cuál es el conector lógico adversativo en la siguiente lista?', 'Y', 'Por lo tanto', 'Sin embargo', 'Además', 'C', 'COMUNICACIÓN', 4, 'FACIL', NULL),
('20000000-0000-0000-0000-000000000008', '¿Quién escribió el poemario modernista "Trilce"?', 'José Santos Chocano', 'César Vallejo', 'Abraham Valdelomar', 'Manuel González Prada', 'B', 'COMUNICACIÓN', 4, 'MEDIO', NULL),
('20000000-0000-0000-0000-000000000009', '¿Qué tipo de texto tiene como propósito principal convencer al lector sobre una tesis?', 'Instructivo', 'Expositivo', 'Argumentativo', 'Descriptivo', 'C', 'COMUNICACIÓN', 5, 'MEDIO', NULL),
('20000000-0000-0000-0000-000000000010', 'En el análisis métrico, ¿qué es la sinalefa?', 'La unión de la vocal final de una palabra con la inicial de la siguiente', 'La separación de un diptongo', 'El acento en la última sílaba del verso', 'La rima asonante al final del poema', 'A', 'COMUNICACIÓN', 5, 'DIFICIL', NULL);

-- ==========================================
-- ÁREA: CIENCIA Y TECNOLOGÍA (10 preguntas)
-- ==========================================
INSERT INTO juego_preguntas (id_pregunta, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, area, grado, dificultad, id_cuestionario) 
VALUES 
('30000000-0000-0000-0000-000000000001', '¿Cuál es el órgano principal del sistema circulatorio humano?', 'Los pulmones', 'El cerebro', 'El corazón', 'El estómago', 'C', 'CIENCIA Y TECNOLOGIA', 1, 'FACIL', NULL),
('30000000-0000-0000-0000-000000000002', '¿Qué gas es indispensable para el proceso de fotosíntesis de las plantas?', 'Oxígeno', 'Dióxido de Carbono', 'Nitrógeno', 'Helio', 'B', 'CIENCIA Y TECNOLOGIA', 1, 'FACIL', NULL),
('30000000-0000-0000-0000-000000000003', '¿Cuál es la fórmula química del agua?', 'CO2', 'NaCl', 'H2O', 'O2', 'C', 'CIENCIA Y TECNOLOGIA', 2, 'FACIL', NULL),
('30000000-0000-0000-0000-000000000004', '¿Qué partícula atómica posee carga eléctrica negativa y órbita alrededor del núcleo?', 'Protón', 'Neutrón', 'Electrón', 'Quark', 'C', 'CIENCIA Y TECNOLOGIA', 2, 'MEDIO', NULL),
('30000000-0000-0000-0000-000000000005', '¿Cuál es el orgánulo encargado de la respiración celular y producción de energía (ATP)?', 'El núcleo', 'El cloroplasto', 'La mitocondria', 'El aparato de Golgi', 'C', 'CIENCIA Y TECNOLOGIA', 3, 'MEDIO', NULL),
('30000000-0000-0000-0000-000000000006', '¿Qué ley física enuncia que "a toda acción corresponde una reacción de igual magnitud y sentido opuesto"?', 'Primera Ley de Newton', 'Segunda Ley de Newton', 'Tercera Ley de Newton', 'Ley de Gravitación', 'C', 'CIENCIA Y TECNOLOGIA', 3, 'MEDIO', NULL),
('30000000-0000-0000-0000-000000000007', '¿Cuál es el elemento químico más abundante en el universo?', 'Oxígeno', 'Hidrógeno', 'Helio', 'Carbono', 'B', 'CIENCIA Y TECNOLOGIA', 4, 'MEDIO', NULL),
('30000000-0000-0000-0000-000000000008', '¿Qué tipo de división celular da origen a los gametos (óvulos y espermatozoides)?', 'Mitosis', 'Meiosis', 'Fisión binaria', 'Gemación', 'B', 'CIENCIA Y TECNOLOGIA', 4, 'DIFICIL', NULL),
('30000000-0000-0000-0000-000000000009', '¿Cuál es el valor aproximado de la velocidad de la luz en el vacío?', '3,000 km/s', '300,000 km/s', '150,000 km/s', '1,000,000 km/s', 'B', 'CIENCIA Y TECNOLOGIA', 5, 'MEDIO', NULL),
('30000000-0000-0000-0000-000000000010', 'De acuerdo a la teoría de la relatividad especial, ¿qué sucede con el tiempo a velocidades cercanas a la de la luz?', 'Se detiene por completo', 'Transcurre más rápido', 'Transcurre más lento (dilatación)', 'No sufre alteración', 'C', 'CIENCIA Y TECNOLOGIA', 5, 'DIFICIL', NULL);

-- ==========================================
-- ÁREA: CIENCIAS SOCIALES (10 preguntas)
-- ==========================================
INSERT INTO juego_preguntas (id_pregunta, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, area, grado, dificultad, id_cuestionario) 
VALUES 
('40000000-0000-0000-0000-000000000001', '¿Quién fue el último Inca del Imperio del Tahuantinsuyo?', 'Manco Cápac', 'Atahualpa', 'Túpac Yupanqui', 'Huáscar', 'B', 'CIENCIAS SOCIALES', 1, 'FACIL', NULL),
('40000000-0000-0000-0000-000000000002', '¿Cuál es el río más largo y caudaloso de Sudamérica y del mundo?', 'Río Nilo', 'Río Misisipi', 'Río Amazonas', 'Río Rímac', 'C', 'CIENCIAS SOCIALES', 1, 'FACIL', NULL),
('40000000-0000-0000-0000-000000000003', '¿Qué cultura preincaica es famosa por sus enormes líneas y geoglifos en el desierto?', 'Chavín', 'Paracas', 'Nazca', 'Moche', 'C', 'CIENCIAS SOCIALES', 2, 'FACIL', NULL),
('40000000-0000-0000-0000-000000000004', '¿En qué continente se originó la civilización de la Antigua Mesopotamia?', 'Europa', 'África', 'Asia', 'América', 'C', 'CIENCIAS SOCIALES', 2, 'MEDIO', NULL),
('40000000-0000-0000-0000-000000000005', '¿En qué año se proclamó la Independencia del Perú?', '1810', '1821', '1824', '1879', 'B', 'CIENCIAS SOCIALES', 3, 'FACIL', NULL),
('40000000-0000-0000-0000-000000000006', '¿Qué batalla consolidó definitivamente la Independencia del Perú y de América del Sur en 1824?', 'Batalla de Junín', 'Batalla de Ayacucho', 'Batalla de Arica', 'Batalla de Angamos', 'B', 'CIENCIAS SOCIALES', 3, 'MEDIO', NULL),
('40000000-0000-0000-0000-000000000007', '¿Cuál es la capa de la atmósfera donde ocurren los fenómenos climáticos como lluvias y vientos?', 'Troposfera', 'Estratosfera', 'Termosfera', 'Mesosfera', 'A', 'CIENCIAS SOCIALES', 4, 'MEDIO', NULL),
('40000000-0000-0000-0000-000000000008', '¿Qué acontecimiento histórico dio inicio a la Edad Moderna en 1492?', 'La Revolución Francesa', 'La caída de Constantinopla', 'La llegada de Colón a América', 'La invención de la escritura', 'C', 'CIENCIAS SOCIALES', 4, 'MEDIO', NULL),
('40000000-0000-0000-0000-000000000009', '¿Cuál fue la principal causa detonante del inicio de la Primera Guerra Mundial en 1914?', 'La invasión a Polonia', 'La caída de la bolsa de Nueva York', 'El asesinato del archiduque Francisco Fernando', 'La revolución Rusa', 'C', 'CIENCIAS SOCIALES', 5, 'MEDIO', NULL),
('40000000-0000-0000-0000-000000000010', '¿Qué organismo internacional fue fundado en 1945 con el fin de mantener la paz y la seguridad internacional?', 'La Sociedad de Naciones', 'La Organización de las Naciones Unidas (ONU)', 'La Unión Europea', 'El Fondo Monetario Internacional', 'B', 'CIENCIAS SOCIALES', 5, 'FACIL', NULL);

-- ==========================================
-- ÁREA: INGLÉS (10 preguntas)
-- ==========================================
INSERT INTO juego_preguntas (id_pregunta, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, area, grado, dificultad, id_cuestionario) 
VALUES 
('50000000-0000-0000-0000-000000000001', 'Complete the sentence: "She _____ a student at I.E. Huanoquite."', 'am', 'is', 'are', 'be', 'B', 'INGLES', 1, 'FACIL', NULL),
('50000000-0000-0000-0000-000000000002', 'Choose the correct greeting for the afternoon.', 'Good morning', 'Good afternoon', 'Good night', 'Goodbye', 'B', 'INGLES', 1, 'FACIL', NULL),
('50000000-0000-0000-0000-000000000003', 'What is the plural form of the word "child"?', 'childs', 'childrens', 'children', 'childes', 'C', 'INGLES', 2, 'FACIL', NULL),
('50000000-0000-0000-0000-000000000004', 'Complete the question: "_____ do you live?" - "I live in Cusco."', 'What', 'Who', 'Where', 'When', 'C', 'INGLES', 2, 'FACIL', NULL),
('50000000-0000-0000-0000-000000000005', 'Complete with the past tense: "Yesterday, I _____ my homework on the laptop."', 'do', 'did', 'done', 'doing', 'B', 'INGLES', 3, 'FACIL', NULL),
('50000000-0000-0000-0000-000000000006', 'Choose the correct comparative: "Reading a book is _____ than watching TV."', 'more interesting', 'interestinger', 'most interesting', 'interesting', 'A', 'INGLES', 3, 'MEDIO', NULL),
('50000000-0000-0000-0000-000000000007', 'Complete: "If it rains tomorrow, we _____ go to the sports field."', 'won''t', 'don''t', 'didn''t', 'haven''t', 'A', 'INGLES', 4, 'MEDIO', NULL),
('50000000-0000-0000-0000-000000000008', 'Which verb form goes in the present perfect: "I have _____ to Cusco three times."', 'went', 'go', 'gone', 'going', 'C', 'INGLES', 4, 'MEDIO', NULL),
('50000000-0000-0000-0000-000000000009', 'What is the opposite of the word "GENEROUS"?', 'Kind', 'Selfish', 'Polite', 'Lazy', 'B', 'INGLES', 5, 'MEDIO', NULL),
('50000000-0000-0000-0000-000000000010', 'Choose the modal verb that expresses a strong obligation: "You _____ wear your school uniform."', 'might', 'must', 'could', 'would', 'B', 'INGLES', 5, 'FACIL', NULL);
