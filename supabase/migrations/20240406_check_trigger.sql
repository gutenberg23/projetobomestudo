-- Remover o trigger existente se houver
DROP TRIGGER IF EXISTS sync_profiles_to_perfil_trigger ON profiles;

-- Criar o trigger novamente
CREATE TRIGGER sync_profiles_to_perfil_trigger
AFTER INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_profiles_to_perfil();

-- Verificar se o trigger foi criado
SELECT 
    trigger_name,
    event_manipulation,
    event_object_schema,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'profiles'; 