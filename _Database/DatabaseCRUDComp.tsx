// lib/DatabaseCrudComp.ts
import { NextRequest, NextResponse } from "next/server";
import {
  query,
  verifyToken,
  safeHandleBlobImage,
  toCamelCase,
  safeHandleBlobFile,
} from "@/db";

interface FieldConfig {
  fieldName: string;
  type: "text" | "number" | "image" | "file" | "float" | "multiple" | "iconDropdown" | "blockDisplayArray";
}

interface ManyToManyConfig {
  joinTable: string;
  mainKey: string;
  relatedKey: string;
  relatedTable: string;
  relatedNameField: string;
}

interface RelatedConfig {
  table: string;
  customJoin: string;
  fields?: string[];
  joinType?: "LEFT JOIN" | "INNER JOIN" | "RIGHT JOIN";
}

interface CrudConfig {
  table: string;
  orderBy?: string;
  orderDirection?: "ASC" | "DESC";
  afterCreate?: (formData: FormData) => Promise<any>;
  fields: FieldConfig[];
  manyToManyJoin?: ManyToManyConfig;
  related?: RelatedConfig[];
  customSelect?: string[];
  allowGuestPost?: boolean;
  allowGuestPatch?: boolean;
  allowGuestDelete?: boolean;
  afterPatch?: (id: string, formData: FormData) => Promise<any>;
  where?: string;
  upsert?: boolean;
}

// Helper function to pluralize table names correctly
function pluralize(base: string): string {
  return base.endsWith("y") ? base.slice(0, -1) + "ies" : base + "s";
}

export function DatabaseCrudComp(config: CrudConfig) {
  const defaultDirection = config.orderDirection || "DESC";

  // Auto-detect One-to-Many fields ending with "Id"
  const oneToManyFields = config.fields.filter(
    (f) => f.fieldName !== "Id" && f.fieldName.endsWith("Id")
  );

  // =========================
  // GET
  // =========================
  const GET = async () => {
    try {
      let orderByField = config.orderBy || config.fields[0]?.fieldName;
      let sqlSelect = [`${config.table}.*`];

      // Handle customSelect if exists
      if (Array.isArray(config.customSelect) && config.customSelect.length > 0) {
        sqlSelect.push(...config.customSelect);
      }

      // Auto-join One-to-Many fields - add SELECT columns
      for (const f of oneToManyFields) {
        const base = f.fieldName.replace(/Id$/, "");
        const relatedTable = pluralize(base);

        sqlSelect.push(`${relatedTable}.Title AS ${relatedTable}Title`);
        sqlSelect.push(`${relatedTable}.Thumbnail AS ${relatedTable}Thumbnail`);
      }

      // Handle Many-to-Many joins if exists
      if (config.manyToManyJoin) {
        const singular = config.manyToManyJoin.relatedTable.replace(/s$/, "");
        sqlSelect.push(`GROUP_CONCAT(${config.manyToManyJoin.joinTable}.${config.manyToManyJoin.relatedKey}) AS ${singular}Ids`);
        sqlSelect.push(`GROUP_CONCAT(${config.manyToManyJoin.relatedTable}.${config.manyToManyJoin.relatedNameField}) AS ${config.manyToManyJoin.relatedTable}`);
      }

      let sql = `SELECT ${sqlSelect.join(", ")} FROM ${config.table}`;

      // One-to-Many LEFT JOIN - use same pluralization
      for (const f of oneToManyFields) {
        const base = f.fieldName.replace(/Id$/, "");
        const relatedTable = pluralize(base);
        sql += ` LEFT JOIN ${relatedTable} ON ${config.table}.${f.fieldName} = ${relatedTable}.Id`;
      }

      // Many-to-Many JOIN
      if (config.manyToManyJoin) {
        sql += `
          LEFT JOIN ${config.manyToManyJoin.joinTable} 
            ON ${config.manyToManyJoin.joinTable}.${config.manyToManyJoin.mainKey} = ${config.table}.Id
          LEFT JOIN ${config.manyToManyJoin.relatedTable} 
            ON ${config.manyToManyJoin.relatedTable}.Id = ${config.manyToManyJoin.joinTable}.${config.manyToManyJoin.relatedKey}
        `;
      }

      // Related joins
      if (Array.isArray(config.related) && config.related.length > 0) {
        config.related.forEach((rel) => {
          const joinType = rel.joinType || "LEFT JOIN";
          sql += ` ${joinType} ${rel.table} ON ${rel.customJoin}`;
        });
      }

      // Build WHERE clause
      if (config.where) {
        sql += ` WHERE ${config.where}`;
      }

      // Add GROUP BY if aggregate functions or Many-to-Many are used
      const hasAggregates = sqlSelect.some((c) => /\b(COUNT|SUM|AVG|MIN|MAX|GROUP_CONCAT)\b/i.test(c));
      if (hasAggregates || config.manyToManyJoin) {
        sql += ` GROUP BY ${config.table}.Id`;
      }
      if (orderByField) sql += ` ORDER BY ${orderByField} ${defaultDirection}`;

      const results = await query(sql, []);

      return NextResponse.json(results);
    } catch (err: any) {
      console.error("[GET] Error:", err);
      return NextResponse.json(
        { status: "error", message: "Failed to fetch data" },
        { status: 500 }
      );
    }
  };

  // =====================================
  // POST
  // =====================================
  const POST = async (req: NextRequest) => {
    if (!config.allowGuestPost) {
      try {
        verifyToken(req);
      } catch (err: any) {
        return NextResponse.json(
          { status: "error", message: err.message },
          { status: 401 }
        );
      }
    }

    try {
      const formData = await req.formData();
      const columns: string[] = [];
      const values: any[] = [];

      for (const f of config.fields) {
        const camelName = toCamelCase(f.fieldName);
        const raw = formData.get(f.fieldName) ?? formData.get(camelName);

        if (f.type === "image") {
          const filename = raw ? await safeHandleBlobImage(raw) : "logo.png";
          columns.push(f.fieldName);
          values.push(filename);
        } else if (f.type === "file") {
          const filename = raw ? await safeHandleBlobFile(raw) : "file.dat";
          columns.push(f.fieldName);
          values.push(filename);
        } else if (f.type === "float") {
          columns.push(f.fieldName);
          values.push(parseFloat((raw?.toString() || "0")));
        } else if (f.type === "number") {
          columns.push(f.fieldName);
          values.push(parseInt((raw?.toString() || "0"), 10));
        } else if (f.type === "text" || f.type === "iconDropdown" || f.type === "blockDisplayArray") {
          columns.push(f.fieldName);
          values.push(raw?.toString() || null);
        } else if (f.type === "multiple") {
          continue;
        }
      }

      if (!columns.length) {
        return NextResponse.json(
          { status: "error", message: "No data provided" },
          { status: 400 }
        );
      }

      const insertKeyword = config.upsert ? "INSERT IGNORE" : "INSERT";
      const sql = `${insertKeyword} INTO ${config.table} (${columns.join(",")}) VALUES (${columns.map(() => "?").join(",")})`;
      const result: any = await query(sql, values);
      const insertedId = result.insertId;

      // afterCreate hook
      if (config.afterCreate) {
        try {
          await config.afterCreate(formData);
        } catch (err) {
          console.error("afterCreate error:", err);
        }
      }

      // many-to-many
      if (config.manyToManyJoin) {
        const singularCamel = toCamelCase(config.manyToManyJoin.relatedTable.replace(/s$/, ""));
        const rawIds = formData.get(`${singularCamel}Ids`)?.toString() || "";
        const ids = rawIds.split(",").map((i) => parseInt(i, 10)).filter(Boolean);

        if (ids.length > 0) {
          const pivotValues = ids.map((i) => [insertedId, i]);
          const pivotSql = `
            INSERT INTO ${config.manyToManyJoin.joinTable}
              (${config.manyToManyJoin.mainKey}, ${config.manyToManyJoin.relatedKey})
            VALUES ${pivotValues.map(() => "(?, ?)").join(",")}
          `;
          await query(pivotSql, pivotValues.flat());
        }
      }

      return NextResponse.json({
        status: "success",
        message: "Created",
        id: insertedId,
      });
    } catch (err) {
      console.error("[POST] Error:", err);
      return NextResponse.json(
        { status: "error", message: "Insert failed" },
        { status: 500 }
      );
    }
  };

  // =========================
  // PATCH
  // =========================
  const PATCH = async (req: NextRequest) => {
    if (!config.allowGuestPatch) {
      try {
        verifyToken(req);
      } catch (err: any) {
        return NextResponse.json(
          { status: "error", message: err.message },
          { status: 401 }
        );
      }
    }

    try {
      const data = await req.formData();
      const id = (data.get("id") || data.get("Id"))?.toString();
      if (!id) return NextResponse.json({ status: "error", message: "ID required" }, { status: 400 });

      const setClauses: string[] = [];
      const values: any[] = [];

      console.log('[PATCH] All FormData entries:');
      for (const [key, value] of data.entries()) {
        console.log(`  ${key}:`, typeof value, value instanceof Blob ? 'Blob' : String(value).substring(0, 50));
      }

      for (const f of config.fields) {
        const camelName = toCamelCase(f.fieldName);
        const raw = data.get(f.fieldName) ?? data.get(camelName);
        console.log(`[PATCH] Field ${f.fieldName} (camel: ${camelName}), type: ${f.type}, raw:`, raw ? (typeof raw + ' ' + (raw instanceof Blob ? 'Blob' : String(raw).substring(0, 30))) : 'null');
        if (raw == null) continue;

        let value: any;
        if (f.type === "image") {
          console.log(`[PATCH] Processing ${f.fieldName} (${f.type}):`, typeof raw, raw instanceof Blob ? 'Blob' : raw?.toString().substring(0, 50));
          value = await safeHandleBlobImage(raw);
          console.log(`[PATCH] Result for ${f.fieldName}:`, value);
          if (!value || typeof value !== 'string') {
            value = "logo.png";
          }
        }
        else if (f.type === "file") {
          value = await safeHandleBlobFile(raw);
          console.log(`[PATCH] Result for ${f.fieldName}:`, value);
          if (!value || typeof value !== 'string') {
            value = "file.dat";
          }
        }
        else if (f.type === "float") {
          value = parseFloat(raw.toString());
          if (isNaN(value)) continue;
        }
        else if (f.type === "number") {
          value = parseInt(raw.toString(), 10);
          if (isNaN(value)) continue;
        }
        else {
          value = raw.toString();
        }

        setClauses.push(`${f.fieldName} = ?`);
        values.push(value);
      }

      if (setClauses.length > 0) {
        const sql = `UPDATE ${config.table} SET ${setClauses.join(", ")} WHERE Id = ?`;

        // Convert id to number and add to values array
        const idValue = parseInt(id, 10);
        values.push(idValue);

        console.log('SQL:', sql);
        console.log('Values:', values);
        console.log('Value types:', values.map(v => typeof v));

        await query(sql, values);
      }

      // many-to-many
      if (config.manyToManyJoin) {
        const singularCamel = toCamelCase(config.manyToManyJoin.relatedTable.replace(/s$/, ""));
        const rawIds = data.get(`${singularCamel}Ids`)?.toString() || "";
        const ids = rawIds.split(",").map(i => parseInt(i, 10)).filter(Boolean);

        const mainIdValue = parseInt(id, 10);
        await query(`DELETE FROM ${config.manyToManyJoin.joinTable} WHERE ${config.manyToManyJoin.mainKey} = ?`, [mainIdValue]);

        if (ids.length > 0) {
          const pivotValues = ids.map((i) => [mainIdValue, i]);
          const pivotSql = `INSERT INTO ${config.manyToManyJoin.joinTable} (${config.manyToManyJoin.mainKey}, ${config.manyToManyJoin.relatedKey}) VALUES ${pivotValues.map(() => "(?, ?)").join(",")}`;
          await query(pivotSql, pivotValues.flat());
        }
      }

      // afterPatch hook
      if (config.afterPatch) {
        try {
          await config.afterPatch(id, data);
        } catch (err) {
          console.error("afterPatch error:", err);
        }
      }

      return NextResponse.json({ status: "success", message: "Updated", id });
    } catch (err: any) {
      console.error("[PATCH] Error:", err);
      return NextResponse.json({ status: "error", message: "Update failed" }, { status: 500 });
    }
  };

  // =========================
  // DELETE
  // =========================
  const DELETE = async (req: NextRequest) => {
    if (!config.allowGuestDelete) {
      try {
        verifyToken(req);
      } catch (err: any) {
        return NextResponse.json(
          { status: "error", message: err.message },
          { status: 401 }
        );
      }
    }

    try {
      const data = await req.formData();
      const id = (data.get("id") || data.get("Id"))?.toString();
      if (!id) return NextResponse.json({ status: "error", message: "ID required" }, { status: 400 });

      // many-to-many cleanup
      if (config.manyToManyJoin) {
        await query(`DELETE FROM ${config.manyToManyJoin.joinTable} WHERE ${config.manyToManyJoin.mainKey} = ?`, [id]);
      }

      await query(`DELETE FROM ${config.table} WHERE Id = ?`, [id]);
      return NextResponse.json({ status: "success", message: "Deleted", id });
    } catch (err: any) {
      console.error("[DELETE] Error:", err);
      return NextResponse.json({ status: "error", message: "Delete failed" }, { status: 500 });
    }
  };

  return { GET, POST, PATCH, DELETE };
}