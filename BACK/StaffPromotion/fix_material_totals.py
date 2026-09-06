from pathlib import Path

path = Path(r'd:\FINALPROJECT\BACK\StaffPromotion\staffpromotion\views.py')
text = path.read_text(encoding='utf-8')
old = '''    # ========================================================
    # UPDATE
    # ========================================================

    if request.method in [
        "PUT",
        "PATCH"
    ]:

        serializer = PromotionMaterialSerializer(
            material,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            updated_material = serializer.save()

            create_system_log(
                request.user,
                "PROMOTION_MATERIAL_UPDATED",
                (
                    f"Promotion material "
                    f"{updated_material.id} updated"
                ),
                request
            )

            return Response(
                PromotionMaterialSerializer(
                    updated_material
                ).data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # ========================================================
    # DELETE
    # ========================================================

    if request.method == "DELETE":

        material_id = material.id

        material.delete()

        create_system_log(
            request.user,
            "PROMOTION_MATERIAL_DELETED",
            f"Promotion material {material_id} deleted",
            request
        )

        return Response(
            {
                "message":
                "Promotion material deleted successfully."
            },
            status=status.HTTP_204_NO_CONTENT
        )
'''
new = '''    # ========================================================
    # UPDATE
    # ========================================================

    if request.method in [
        "PUT",
        "PATCH"
    ]:

        serializer = PromotionMaterialSerializer(
            material,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            updated_material = serializer.save()
            updated_material.application.refresh_from_db()
            updated_material.application.recalculate_points()

            create_system_log(
                request.user,
                "PROMOTION_MATERIAL_UPDATED",
                (
                    f"Promotion material "
                    f"{updated_material.id} updated"
                ),
                request
            )

            return Response(
                PromotionMaterialSerializer(
                    updated_material
                ).data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # ========================================================
    # DELETE
    # ========================================================

    if request.method == "DELETE":

        material_id = material.id
        application = material.application

        material.delete()

        if application:
            application.refresh_from_db()
            application.recalculate_points()

        create_system_log(
            request.user,
            "PROMOTION_MATERIAL_DELETED",
            f"Promotion material {material_id} deleted",
            request
        )

        return Response(
            {
                "message":
                "Promotion material deleted successfully."
            },
            status=status.HTTP_204_NO_CONTENT
        )
'''
idx = text.rfind(old)
if idx == -1:
    raise SystemExit('old block not found')
text = text[:idx] + new + text[idx + len(old):]
path.write_text(text, encoding='utf-8')
print('updated views.py')
