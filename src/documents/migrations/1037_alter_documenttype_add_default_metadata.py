# Generated by Django 4.1.7 on 2023-07-23 17:36

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '1036_add_metadata'),
    ]

    operations = [
        migrations.AddField(
            model_name='documenttype',
            name='default_metadata',
            field=models.JSONField(blank=True, help_text='Default JSON metadata', null=True, verbose_name='default_metadata'),
        ),
        migrations.AlterField(
            model_name='metadata',
            name='document',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='document', to='documents.document', verbose_name='document'),
        ),
    ]