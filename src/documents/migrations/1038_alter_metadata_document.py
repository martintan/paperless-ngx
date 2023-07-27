# Generated by Django 4.1.7 on 2023-07-27 02:44

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '1037_alter_documenttype_add_default_metadata'),
    ]

    operations = [
        migrations.AlterField(
            model_name='metadata',
            name='document',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='metadatas', to='documents.document', verbose_name='document'),
        ),
    ]