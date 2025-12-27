-- =====================================================
-- НАСТРОЙКА ТРИГГЕРА АУТЕНТИФИКАЦИИ
-- ⚠️ ВАЖНО: Этот скрипт нужно выполнить от имени postgres (service_role)
-- =====================================================

-- Удаляем старый триггер если существует
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Создаем триггер для автоматического создания профиля
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Проверка создания триггера
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
